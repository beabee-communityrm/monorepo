import {
  ContributionType,
  RoleType,
  ContributionPeriod,
  NewsletterStatus
} from "@beabee/beabee-common";
import { FindManyOptions, FindOneOptions, FindOptionsWhere, In } from "typeorm";

import { database } from "#core/database";
import { log as mainLogger } from "#core/logging";
import { cleanEmailAddress, isDuplicateIndex } from "#utils";
import { generatePassword, isValidPassword } from "#utils/auth";
import { generateContactCode } from "#utils/contact";
import type { LocaleObject } from "@beabee/locales";

import { apiKeyService } from "./ApiKeyService.js";
import { calloutsService } from "./CalloutsService.js";
import { contactMfaService } from "./ContactMfaService.js";
import { emailService } from "./EmailService.js";
import { newsletterService } from "./NewsletterService.js";
import { optionsService } from "./OptionsService.js";
import { paymentService } from "./PaymentService.js";
import { ReferralsService } from "./ReferralsService.js";
import { resetSecurityFlowService } from "./ResetSecurityFlowService.js";
import { SegmentService } from "./SegmentService.js";
import { uploadFlowService } from "./UploadFlowService.js";

import {
  Contact,
  ContactProfile,
  ContactRole,
  GiftFlow,
  Password,
  Project,
  ProjectEngagement
} from "@beabee/models";

import {
  BadRequestError,
  CantUpdateContribution,
  DuplicateEmailError,
  NotFoundError,
  UnauthorizedError
} from "#errors/index";

import {
  CONTACT_MFA_TYPE,
  LOGIN_CODES,
  RESET_SECURITY_FLOW_TYPE,
  RESET_SECURITY_FLOW_ERROR_CODE,
  PaymentForm
} from "@beabee/beabee-common";

export type PartialContact = Pick<Contact, "email" | "contributionType"> &
  Partial<Contact>;

interface ForceUpdateContribution {
  type: ContributionType.Manual | ContributionType.None;
  period?: ContributionPeriod;
  amount?: number;
  source?: string;
  reference?: string;
}

const log = mainLogger.child({ app: "contacts-service" });

class ContactsService {
  async find(options?: FindManyOptions<Contact>): Promise<Contact[]> {
    return await database.getRepository(Contact).find(options);
  }

  async findByIds(
    ids: string[],
    options?: FindOneOptions<Contact>
  ): Promise<Contact[]> {
    return await database
      .getRepository(Contact)
      .findBy({ id: In(ids), ...options });
  }

  async findOne(
    options: FindOneOptions<Contact>
  ): Promise<Contact | undefined> {
    // TODO: check undefined
    return (
      (await database.getRepository(Contact).findOne(options)) || undefined
    );
  }

  async findOneBy(
    where: FindOptionsWhere<Contact>
  ): Promise<Contact | undefined> {
    // TODO: check undefined
    return (
      (await database.getRepository(Contact).findOneBy(where)) || undefined
    );
  }

  async findByLoginOverride(code: string): Promise<Contact | undefined> {
    // TODO: check undefined
    return (
      (await database
        .createQueryBuilder(Contact, "m")
        .where("m.loginOverride ->> 'code' = :code", { code: code })
        .andWhere("m.loginOverride ->> 'expires' > :now", { now: new Date() })
        .getOne()) || undefined
    );
  }

  async createContact(
    partialContact: Partial<Contact> & Pick<Contact, "email">,
    partialProfile: Partial<ContactProfile> = {},
    locale: LocaleObject,
    opts = { sync: true }
  ): Promise<Contact> {
    log.info("Create contact", { partialContact, partialProfile });

    try {
      const contact = database.getRepository(Contact).create({
        referralCode: generateContactCode(partialContact),
        pollsCode: generateContactCode(partialContact),
        roles: [],
        password: Password.none,
        firstname: "",
        lastname: "",
        contributionType: ContributionType.None,
        ...partialContact,
        email: cleanEmailAddress(partialContact.email)
      });
      await database.getRepository(Contact).save(contact);

      contact.profile = database.getRepository(ContactProfile).create({
        ...partialProfile,
        contact: contact
      });
      await database.getRepository(ContactProfile).save(contact.profile);

      await paymentService.createContact(contact);

      if (opts.sync) {
        await newsletterService.upsertContact(contact);
      }

      await emailService.sendTemplateToAdmin("new-member", { contact }, locale);

      return contact;
    } catch (error) {
      if (isDuplicateIndex(error, "email")) {
        throw new DuplicateEmailError();
      } else if (
        isDuplicateIndex(error, "referralCode") ||
        isDuplicateIndex(error, "pollsCode")
      ) {
        return await this.createContact(
          partialContact,
          partialProfile,
          locale,
          opts
        );
      }
      throw error;
    }
  }

  /**
   * Update a contact, syncing with the payment service and optionally the
   * newsletter service
   *
   * @param contact The contact to update
   * @param updates The updates to apply to the contact
   * @param opts Options for the update
   */
  async updateContact(
    contact: Contact,
    updates: Partial<Contact>,
    opts = { sync: true }
  ): Promise<void> {
    log.info("Update contact " + contact.id, {
      contactId: contact.id,
      updates
    });

    if (updates.email) {
      updates.email = cleanEmailAddress(updates.email);
    }

    const oldEmail = updates.email && contact.email;

    Object.assign(contact, updates);
    try {
      await database.getRepository(Contact).update(contact.id, updates);
    } catch (err) {
      throw isDuplicateIndex(err, "email") ? new DuplicateEmailError() : err;
    }

    if (opts.sync) {
      await newsletterService.upsertContact(contact, updates, oldEmail);
    }

    await paymentService.updateContact(contact, updates);
  }

  /**
   * Update a contact's role, creating it if it doesn't exist.
   * Also toggles the newsletter active member tag if needed.
   *
   * @param contact The contact to update the role for
   * @param roleType The role to update
   * @param updates The updates to apply to the role
   */
  async updateContactRole(
    contact: Contact,
    roleType: RoleType,
    updates: { dateAdded?: Date; dateExpires?: Date | null }
  ): Promise<ContactRole> {
    log.info(`Update role ${roleType} for ${contact.id}`, updates);

    const wasActive = contact.membership?.isActive;

    let role = contact.roles.find((p) => p.type === roleType);
    if (role) {
      role.dateAdded = updates.dateAdded || role.dateAdded;
      role.dateExpires = updates.dateExpires || role.dateExpires;
    } else {
      role = database.getRepository(ContactRole).create({
        type: roleType,
        dateAdded: updates?.dateAdded || new Date(),
        dateExpires: updates?.dateExpires || null
      });
      contact.roles.push(role);
    }

    await database.getRepository(Contact).save(contact);

    if (!wasActive && contact.membership?.isActive) {
      await newsletterService.addTagToContacts(
        [contact],
        optionsService.getText("newsletter-active-member-tag")
      );
    } else if (wasActive && !contact.membership.isActive) {
      await newsletterService.removeTagFromContacts(
        [contact],
        optionsService.getText("newsletter-active-member-tag")
      );
    }

    return role;
  }

  /**
   * Extend a contact's role if the new date is later than the current one, or
   * sets it if there is no current expiry date

   * @param contact The contact to extend the role for
   * @param roleType The role to extend
   * @param dateExpires The new date to extend the role to
   */
  async extendContactRole(
    contact: Contact,
    roleType: RoleType,
    dateExpires: Date
  ): Promise<void> {
    const p = contact.roles.find((p) => p.type === roleType);
    log.info(`Extend role ${roleType} for ${contact.id}`, {
      contactId: contact.id,
      role: roleType,
      prevDate: p?.dateExpires,
      newDate: dateExpires
    });
    if (!p?.dateExpires || dateExpires > p.dateExpires) {
      await this.updateContactRole(contact, roleType, { dateExpires });
    }
  }

  /**
   * Revoke a contact's role.
   *
   * @param contact The contact to revoke the role for
   * @param roleType The role to revoke
   */
  async revokeContactRole(
    contact: Contact,
    roleType: RoleType
  ): Promise<boolean> {
    log.info(`Revoke role ${roleType} for ${contact.id}`);
    contact.roles = contact.roles.filter((p) => p.type !== roleType);
    const ret = await database.getRepository(ContactRole).delete({
      contactId: contact.id,
      type: roleType
    });

    if (!contact.membership?.isActive) {
      await newsletterService.removeTagFromContacts(
        [contact],
        optionsService.getText("newsletter-active-member-tag")
      );
    }

    return ret.affected !== 0;
  }

  async updateContactProfile(
    contact: Contact,
    updates: Partial<ContactProfile>,
    opts = { sync: true }
  ): Promise<void> {
    log.info("Update contact profile for " + contact.id, { updates });
    const shouldSync =
      opts.sync && (updates.newsletterStatus || updates.newsletterGroups);
    let isFirstSync = false;

    if (shouldSync) {
      contact.profile = await database
        .getRepository(ContactProfile)
        .findOneByOrFail({
          contactId: contact.id
        });
      // If this is the first time the contact is being synced to the newsletter
      // then we need to set the active member tag
      isFirstSync = contact.profile.newsletterStatus === NewsletterStatus.None;
    }

    await database.getRepository(ContactProfile).update(contact.id, updates);

    if (contact.profile) {
      Object.assign(contact.profile, updates);
    }

    if (shouldSync) {
      await newsletterService.upsertContact(contact);
      // Add the active member tag
      if (isFirstSync && contact.membership?.isActive) {
        await newsletterService.addTagToContacts(
          [contact],
          optionsService.getText("newsletter-active-member-tag")
        );
      }
    }
  }

  async updateContactContribution(
    contact: Contact,
    paymentForm: PaymentForm,
    locale: LocaleObject
  ): Promise<void> {
    log.info("Update contribution for " + contact.id, { paymentForm });
    // At the moment the only possibility is to go from whatever contribution
    // type the user was before to an automatic contribution
    const wasManual = contact.contributionType === ContributionType.Manual;

    // Some period changes on active members aren't allowed at the moment to
    // prevent proration problems
    if (
      contact.membership?.isActive &&
      // Annual contributors can't change their period
      contact.contributionPeriod === ContributionPeriod.Annually &&
      paymentForm.period !== ContributionPeriod.Annually
    ) {
      log.info("Can't update contribution for " + contact.id);
      throw new CantUpdateContribution();
    }

    const { startNow, expiryDate } = await paymentService.updateContribution(
      contact,
      paymentForm
    );

    log.info("Updated contribution for " + contact.id, {
      startNow,
      expiryDate
    });

    await this.updateContact(contact, {
      contributionType: ContributionType.Automatic,
      contributionPeriod: paymentForm.period,
      ...(startNow && {
        contributionMonthlyAmount: paymentForm.monthlyAmount
      })
    });

    await this.extendContactRole(contact, "member", expiryDate);

    if (wasManual) {
      await emailService.sendTemplateToContact(
        "manual-to-automatic",
        contact,
        undefined,
        locale
      );
    }
  }

  async cancelContactContribution(
    contact: Contact,
    email: "cancelled-contribution" | "cancelled-contribution-no-survey",
    locale: LocaleObject
  ): Promise<void> {
    log.info("Cancel contribution for " + contact.id);
    await paymentService.cancelContribution(contact);

    await emailService.sendTemplateToContact(email, contact, undefined, locale);
    await emailService.sendTemplateToAdmin(
      "cancelled-member",
      {
        contact: contact
      },
      locale
    );
  }

  /**
   * Permanently delete a contact and all associated data.
   *
   * @param contact The contact
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    // Delete external data first, this is more likely to fail so we'd exit the process early
    await newsletterService.permanentlyDeleteContacts([contact]);
    await paymentService.permanentlyDeleteContact(contact);

    // Delete internal data after the external services are done, this should really never fail
    await resetSecurityFlowService.deleteAll(contact);
    await apiKeyService.permanentlyDeleteContact(contact);
    await ReferralsService.permanentlyDeleteContact(contact);
    await uploadFlowService.permanentlyDeleteContact(contact);
    await SegmentService.permanentlyDeleteContact(contact);
    await calloutsService.permanentlyDeleteContact(contact);
    await contactMfaService.permanentlyDeleteContact(contact);

    log.info("Permanently delete contact " + contact.id);
    await database.runTransaction(async (em) => {
      // Projects are only in the legacy app, so really no one should have any, but we'll delete them just in case
      // TODO: Remove this when we've reworked projects
      await em
        .getRepository(ProjectEngagement)
        .delete({ byContactId: contact.id });
      await em
        .getRepository(ProjectEngagement)
        .delete({ toContactId: contact.id });
      await em
        .getRepository(Project)
        .update({ ownerId: contact.id }, { ownerId: null });

      // Gifts are only in the legacy app, so really no one should have any, but we'll delete them just in case
      // TODO: Remove this when we've reworked gifts
      await em
        .getRepository(GiftFlow)
        .update({ gifteeId: contact.id }, { gifteeId: null });

      await em.getRepository(ContactRole).delete({ contactId: contact.id });
      await em.getRepository(ContactProfile).delete({ contactId: contact.id });
      await em.getRepository(Contact).delete(contact.id);
    });
  }

  /**
   * TODO: Remove this!
   * @deprecated This is a temporary method until we rework manual contribution updates
   * @param contact
   * @param data
   */
  async forceUpdateContactContribution(
    contact: Contact,
    data: ForceUpdateContribution
  ): Promise<void> {
    if (contact.contributionType === ContributionType.Automatic) {
      throw new CantUpdateContribution();
    }

    const period = data.period && data.amount ? data.period : null;
    const monthlyAmount =
      data.period && data.amount
        ? data.amount / (data.period === ContributionPeriod.Annually ? 12 : 1)
        : null;

    await this.updateContact(contact, {
      contributionType: data.type,
      contributionPeriod: period,
      contributionMonthlyAmount: monthlyAmount
    });

    await paymentService.updateData(contact, {
      mandateId: data.source || null,
      customerId: data.reference || null
    });
  }

  /**
   * Increment the number of password tries for a contact.
   * @param contact The contact to increment the password tries for
   * @returns The new number of tries
   */
  async incrementPasswordTries(contact: Contact) {
    contact.password.tries ||= 0;
    contact.password.tries++;
    await this.updateContact(contact, {
      password: { ...contact.password }
    });
    return contact.password.tries;
  }

  async resetPasswordTries(contact: Contact) {
    contact.password.tries = 0;
    await this.updateContact(contact, {
      password: { ...contact.password }
    });
  }

  /**
   * Starts the reset password flow.
   * This is mostly used after the user has clicked on the forgot password the link on the login page.
   * @param email The email of the contact
   * @param resetUrl The reset url
   */
  public async resetPasswordBegin(
    email: string,
    resetUrl: string,
    locale: LocaleObject
  ): Promise<void> {
    const contact = await this.findOneBy({ email });

    if (!contact) {
      return;
    }

    const rpFlow = await resetSecurityFlowService.create(
      contact,
      RESET_SECURITY_FLOW_TYPE.PASSWORD
    );

    await emailService.sendTemplateToContact(
      "reset-password",
      contact,
      {
        rpLink: resetUrl + "/" + rpFlow.id
      },
      locale
    );
  }

  /**
   * Completes the reset password flow.
   * This is mostly used after the user has clicked the link in the email.
   * @param id The reset password flow id
   * @param data
   * @returns The contact associated with the reset password flow
   *
   * @throws {NotFoundError} If the reset password flow doesn't exist
   * @throws {BadRequestError} If the reset password flow type is not PASSWORD
   * @throws {BadRequestError} If MFA is enabled but the MFA type is not TOTP
   * @throws {BadRequestError} If the MFA token is not provided
   * @throws {UnauthorizedError} If the MFA token is invalid
   */
  public async resetPasswordComplete(
    id: string,
    data: { password: string; token?: string }
  ) {
    const rpFlow = await resetSecurityFlowService.get(id);

    if (!rpFlow) {
      throw new NotFoundError({
        code: RESET_SECURITY_FLOW_ERROR_CODE.NOT_FOUND
      });
    }

    if (rpFlow.type !== RESET_SECURITY_FLOW_TYPE.PASSWORD) {
      throw new BadRequestError({
        code: RESET_SECURITY_FLOW_ERROR_CODE.WRONG_TYPE
      });
    }

    // Check if contact has MFA enabled, if so validate MFA
    const mfa = await contactMfaService.get(rpFlow.contact);
    if (mfa) {
      // In the future, we might want to add more types of reset flows
      if (mfa.type !== CONTACT_MFA_TYPE.TOTP) {
        throw new BadRequestError({
          code: RESET_SECURITY_FLOW_ERROR_CODE.WRONG_MFA_TYPE
        });
      }

      if (!data.token) {
        throw new BadRequestError({
          code: RESET_SECURITY_FLOW_ERROR_CODE.MFA_TOKEN_REQUIRED
        });
      }

      const { isValid } = await contactMfaService.checkToken(
        rpFlow.contact,
        data.token,
        1
      );

      if (!isValid) {
        throw new UnauthorizedError({ code: LOGIN_CODES.INVALID_TOKEN });
      }
    }

    await this.updateContact(rpFlow.contact, {
      password: await generatePassword(data.password)
    });

    // Stop all other reset flows if they exist
    await resetSecurityFlowService.deleteAll(rpFlow.contact);

    return rpFlow.contact;
  }

  /**
   * Starts the reset device flow.
   * This is mostly used after the user has clicked on the lost device the link on the login page.
   * @param email The email of the contact
   * @param type The reset device flow type
   * @param resetUrl The reset url
   */
  public async resetDeviceBegin(
    email: string,
    type: RESET_SECURITY_FLOW_TYPE,
    resetUrl: string,
    locale: LocaleObject
  ): Promise<void> {
    const contact = await this.findOneBy({ email });

    // We don't want to leak if the email exists or not
    if (!contact) {
      return;
    }

    // Check if contact has MFA enabled
    const mfa = await contactMfaService.get(contact);
    if (!mfa) {
      return;
    }

    const rdFlow = await resetSecurityFlowService.create(contact, type);

    await emailService.sendTemplateToContact(
      "reset-device",
      contact,
      {
        rpLink: resetUrl + "/" + rdFlow.id
      },
      locale
    );
  }

  /**
   * Completes the reset device flow.
   * This is mostly used after the user has clicked the link in the email.
   * @param id The reset device flow id
   * @param password The password of the contact
   * @returns The contact associated with the reset device flow
   *
   * @throws {NotFoundError} If the reset device flow doesn't exist
   * @throws {BadRequestError} If the reset device flow type is not TOTP
   * @throws {UnauthorizedError} If the password is invalid
   */
  public async resetDeviceComplete(id: string, password: string) {
    const rdFlow = await resetSecurityFlowService.get(id);

    if (!rdFlow) {
      throw new NotFoundError({
        code: RESET_SECURITY_FLOW_ERROR_CODE.NOT_FOUND
      });
    }

    if (rdFlow.type !== RESET_SECURITY_FLOW_TYPE.TOTP) {
      throw new BadRequestError({
        code: RESET_SECURITY_FLOW_ERROR_CODE.WRONG_TYPE
      });
    }

    // Validate password
    const code = await isValidPassword(rdFlow.contact.password, password);
    if (code !== LOGIN_CODES.LOGGED_IN) {
      await this.incrementPasswordTries(rdFlow.contact);
      throw new UnauthorizedError({ code });
    }

    // Reset password tries because the password was correct
    await this.resetPasswordTries(rdFlow.contact);

    // Disable MFA, we can use the unsecure method because we already validated the password
    await contactMfaService.deleteUnsecure(rdFlow.contact);

    // Stop all other reset flows if they exist
    await resetSecurityFlowService.deleteAll(rdFlow.contact);

    return rdFlow.contact;
  }
}

export const contactsService = new ContactsService();