import {
  ContributionType,
  RoleType,
  ContributionPeriod,
  NewsletterStatus,
  PaymentForm,
  LOGIN_CODES,
  CONTACT_MFA_TYPE,
  RESET_SECURITY_FLOW_TYPE,
  RESET_SECURITY_FLOW_ERROR_CODE
} from "@beabee/beabee-common";
import { FindManyOptions, FindOneOptions, FindOptionsWhere, In } from "typeorm";

import { createQueryBuilder, getRepository, runTransaction } from "#database";
import { log as mainLogger } from "#logging";
import { normalizeEmailAddress } from "#utils/index";
import { isDuplicateIndex } from "#utils/db";
import { generatePassword, isValidPassword } from "#utils/auth";
import { generateContactCode } from "#utils/contact";

import ApiKeyService from "#services/ApiKeyService";
import CalloutsService from "#services/CalloutsService";
import ContactMfaService from "#services/ContactMfaService";
import EmailService from "#services/EmailService";
import NewsletterService from "#services/NewsletterService";
import PaymentService from "#services/PaymentService";
import ReferralsService from "#services/ReferralsService";
import ResetSecurityFlowService from "#services/ResetSecurityFlowService";
import SegmentService from "#services/SegmentService";
import UploadFlowService from "#services/UploadFlowService";

import {
  Contact,
  ContactProfile,
  ContactRole,
  ContactTagAssignment,
  GiftFlow,
  Password,
  Project,
  ProjectEngagement
} from "#models/index";

import {
  BadRequestError,
  CantUpdateContribution,
  DuplicateEmailError,
  NotFoundError,
  UnauthorizedError
} from "#errors/index";

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
    return await getRepository(Contact).find(options);
  }

  async findByIds(
    ids: string[],
    options?: FindOneOptions<Contact>
  ): Promise<Contact[]> {
    return await getRepository(Contact).find({
      where: { id: In(ids) },
      ...options
    });
  }

  async findOne(
    options: FindOneOptions<Contact>
  ): Promise<Contact | undefined> {
    // TODO: check undefined
    return (await getRepository(Contact).findOne(options)) || undefined;
  }

  async findOneBy(
    where: FindOptionsWhere<Contact>
  ): Promise<Contact | undefined> {
    // TODO: check undefined
    return (await getRepository(Contact).findOneBy(where)) || undefined;
  }

  async findByLoginOverride(code: string): Promise<Contact | undefined> {
    // TODO: check undefined
    return (
      (await createQueryBuilder(Contact, "m")
        .where("m.loginOverride ->> 'code' = :code", { code: code })
        .andWhere("m.loginOverride ->> 'expires' > :now", { now: new Date() })
        .getOne()) || undefined
    );
  }

  async createContact(
    partialContact: Partial<Contact> & Pick<Contact, "email">,
    partialProfile: Partial<ContactProfile> = {},
    opts = { sync: true }
  ): Promise<Contact> {
    log.info("Create contact", { partialContact, partialProfile });

    try {
      const contact = getRepository(Contact).create({
        referralCode: generateContactCode(partialContact),
        pollsCode: generateContactCode(partialContact),
        roles: [],
        password: Password.none,
        firstname: "",
        lastname: "",
        contributionType: ContributionType.None,
        ...partialContact,
        email: normalizeEmailAddress(partialContact.email)
      });
      await getRepository(Contact).save(contact);

      contact.profile = getRepository(ContactProfile).create({
        ...partialProfile,
        contact: contact
      });
      await getRepository(ContactProfile).save(contact.profile);

      await PaymentService.createContact(contact);

      if (opts.sync) {
        await NewsletterService.upsertContact(contact);
      }

      await EmailService.sendTemplateToAdmin("new-member", { contact });

      return contact;
    } catch (error) {
      if (isDuplicateIndex(error, "email")) {
        throw new DuplicateEmailError();
      } else if (
        isDuplicateIndex(error, "referralCode") ||
        isDuplicateIndex(error, "pollsCode")
      ) {
        return await this.createContact(partialContact, partialProfile, opts);
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
      updates.email = normalizeEmailAddress(updates.email);
    }

    const oldEmail = updates.email && contact.email;

    try {
      await getRepository(Contact).update(contact.id, updates);
    } catch (err) {
      throw isDuplicateIndex(err, "email") ? new DuplicateEmailError() : err;
    }

    Object.assign(contact, updates);

    if (opts.sync) {
      await NewsletterService.upsertContact(contact, undefined, oldEmail);
    }

    await PaymentService.updateContact(contact, updates);
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
      // Only update dateAdded if explicitly provided
      if (updates.dateAdded !== undefined) {
        role.dateAdded = updates.dateAdded;
      }
      // Only update dateExpires if explicitly provided (including null to remove it)
      if (updates.dateExpires !== undefined) {
        role.dateExpires = updates.dateExpires;
      }
    } else {
      role = getRepository(ContactRole).create({
        type: roleType,
        dateAdded: updates.dateAdded || new Date(),
        dateExpires: updates.dateExpires ?? null
      });
      contact.roles.push(role);
    }

    await getRepository(Contact).save(contact);

    if (wasActive !== contact.membership?.isActive) {
      await NewsletterService.upsertContact(contact);
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
    const wasActive = contact.membership?.isActive;

    contact.roles = contact.roles.filter((p) => p.type !== roleType);
    const ret = await getRepository(ContactRole).delete({
      contactId: contact.id,
      type: roleType
    });

    if (wasActive !== contact.membership?.isActive) {
      await NewsletterService.upsertContact(contact);
    }

    return ret.affected !== 0;
  }

  async updateContactProfile(
    contact: Contact,
    updates: Partial<ContactProfile>,
    opts = { sync: true }
  ): Promise<void> {
    const { newsletterStatus, newsletterGroups, ...profileUpdates } = updates;

    if (Object.keys(profileUpdates).length > 0) {
      log.info("Update contact profile for " + contact.id, { profileUpdates });

      await getRepository(ContactProfile).update(contact.id, profileUpdates);
      if (contact.profile) {
        Object.assign(contact.profile, profileUpdates);
      }
    }

    if (opts.sync && (newsletterStatus || newsletterGroups)) {
      await NewsletterService.upsertContact(contact, {
        newsletterStatus,
        newsletterGroups
      });
    }
  }

  async updateContactContribution(
    contact: Contact,
    paymentForm: PaymentForm
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

    const { startNow, expiryDate } = await PaymentService.updateContribution(
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
      await EmailService.sendTemplateToContact("manual-to-automatic", contact);
    }
  }

  async cancelContactContribution(
    contact: Contact,
    email: "cancelled-contribution" | "cancelled-contribution-no-survey"
  ): Promise<void> {
    log.info("Cancel contribution for " + contact.id);
    await PaymentService.cancelContribution(contact);

    await EmailService.sendTemplateToContact(email, contact);
    await EmailService.sendTemplateToAdmin("cancelled-member", {
      contact: contact
    });
  }

  /**
   * Permanently delete a contact and all associated data.
   *
   * @param contact The contact
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    // Delete external data first, this is more likely to fail so we'd exit the process early
    await NewsletterService.permanentlyDeleteContacts([contact]);
    await PaymentService.permanentlyDeleteContact(contact);

    // Delete internal data after the external services are done, this should really never fail
    await ResetSecurityFlowService.deleteAll(contact);
    await ApiKeyService.permanentlyDeleteContact(contact);
    await ReferralsService.permanentlyDeleteContact(contact);
    await UploadFlowService.permanentlyDeleteContact(contact);
    await SegmentService.permanentlyDeleteContact(contact);
    await CalloutsService.permanentlyDeleteContact(contact);
    await ContactMfaService.permanentlyDeleteContact(contact);

    log.info("Permanently delete contact " + contact.id);
    await runTransaction(async (em) => {
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

      await em
        .getRepository(ContactTagAssignment)
        .delete({ contactId: contact.id });
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

    await PaymentService.updateData(contact, {
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
    resetUrl: string
  ): Promise<void> {
    const contact = await this.findOneBy({ email });

    if (!contact) {
      return;
    }

    const rpFlow = await ResetSecurityFlowService.create(
      contact,
      RESET_SECURITY_FLOW_TYPE.PASSWORD
    );

    await EmailService.sendTemplateToContact("reset-password", contact, {
      rpLink: resetUrl + "/" + rpFlow.id
    });
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
    const rpFlow = await ResetSecurityFlowService.get(id);

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
    const mfa = await ContactMfaService.get(rpFlow.contact);
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

      const { isValid } = await ContactMfaService.checkToken(
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
    await ResetSecurityFlowService.deleteAll(rpFlow.contact);

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
    resetUrl: string
  ): Promise<void> {
    const contact = await this.findOneBy({ email });

    // We don't want to leak if the email exists or not
    if (!contact) {
      return;
    }

    // Check if contact has MFA enabled
    const mfa = await ContactMfaService.get(contact);
    if (!mfa) {
      return;
    }

    const rdFlow = await ResetSecurityFlowService.create(contact, type);

    await EmailService.sendTemplateToContact("reset-device", contact, {
      rpLink: resetUrl + "/" + rdFlow.id
    });
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
    const rdFlow = await ResetSecurityFlowService.get(id);

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
    await ContactMfaService.deleteUnsecure(rdFlow.contact);

    // Stop all other reset flows if they exist
    await ResetSecurityFlowService.deleteAll(rdFlow.contact);

    return rdFlow.contact;
  }
}

export const contactsService = new ContactsService();
export default contactsService;
