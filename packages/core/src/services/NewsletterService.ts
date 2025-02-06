import { NewsletterStatus } from "@beabee/beabee-common";

import { getRepository } from "#database";
import { log as mainLogger } from "#logging";

import {
  ContactNewsletterUpdates,
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact
} from "#type/index";
import { MailchimpProvider, NoneProvider } from "#providers";

import { Contact, ContactProfile } from "#models/index";

import config from "#config/config";
import { getContributionDescription } from "#utils/contact";
import { CantUpdateNewsletterContact } from "#errors/CantUpdateNewsletterContact";

const log = mainLogger.child({ app: "newsletter-service" });

/**
 * Convert a contact to a newsletter update object that can be sent to the
 * newsletter provider
 *
 * @param contact The contact
 * @returns A newsletter contact update
 */
async function contactToNlUpdate(
  contact: Contact,
  updates?: ContactNewsletterUpdates
): Promise<UpdateNewsletterContact | undefined> {
  // TODO: Fix that it relies on contact.profile being loaded
  if (!contact.profile) {
    contact.profile = await getRepository(ContactProfile).findOneByOrFail({
      contactId: contact.id
    });
  }

  const status = updates?.newsletterStatus || contact.profile.newsletterStatus;
  if (status === NewsletterStatus.None) {
    return undefined;
  }

  return {
    email: contact.email,
    status,
    groups: updates?.newsletterGroups || contact.profile.newsletterGroups,
    firstname: contact.firstname,
    lastname: contact.lastname,
    fields: {
      REFCODE: contact.referralCode || "",
      POLLSCODE: contact.pollsCode || "",
      C_DESC: getContributionDescription(
        contact.contributionType,
        contact.contributionMonthlyAmount,
        contact.contributionPeriod
      ),
      C_MNTHAMT: contact.contributionMonthlyAmount?.toFixed(2) || "",
      C_PERIOD: contact.contributionPeriod || ""
    },
    isActiveMember: contact.membership?.isActive || false,
    isActiveUser: !!contact.password.hash
  };
}

/**
 * Convert a list of contacts to a list of newsletter updates that can be sent
 * to the newsletter provider, ignoring any contacts that shouldn't be synced
 *
 * @param contacts The list of contacts
 * @returns A list of valid newsletter updates
 */
async function getValidNlUpdates(
  contacts: Contact[]
): Promise<UpdateNewsletterContact[]> {
  const nlUpdates = [];
  for (const contact of contacts) {
    const nlUpdate = await contactToNlUpdate(contact);
    if (nlUpdate) {
      nlUpdates.push(nlUpdate);
    }
  }
  return nlUpdates;
}

class NewsletterService {
  private readonly provider: NewsletterProvider =
    config.newsletter.provider === "mailchimp"
      ? new MailchimpProvider(config.newsletter.settings)
      : new NoneProvider();

  /**
   * Add the given tag to the list of contacts
   *
   * @param contacts List of contacts
   * @param tag The tag to add
   */
  async addTagToContacts(contacts: Contact[], tag: string): Promise<void> {
    log.info(`Add tag ${tag} to ${contacts.length} contacts`);
    await this.provider.addTagToContacts(
      (await getValidNlUpdates(contacts)).map((m) => m.email),
      tag
    );
  }

  /**
   * Remove the given tag from the list of contacts. Any contacts that don't
   * have the tag will be ignored.
   *
   * @param contacts  List of contacts
   * @param tag The tag to remove
   */
  async removeTagFromContacts(contacts: Contact[], tag: string): Promise<void> {
    log.info(`Remove tag ${tag} from ${contacts.length} contacts`);
    await this.provider.removeTagFromContacts(
      (await getValidNlUpdates(contacts)).map((m) => m.email),
      tag
    );
  }

  /**
   * Updates or inserts a contact in the newsletter provider and handles status
   * changes. The contact should have already been updated before calling this
   * method, the updates parameter is just a way to flag the relevant changes
   *
   * @param contact The contact to update or insert
   * @param updates Optional updates to apply to the contact before syncing
   * @param oldEmail Previous email address if the email is being updated
   */
  async upsertContact(
    contact: Contact,
    updates?: ContactNewsletterUpdates,
    oldEmail?: string
  ): Promise<void> {
    const nlUpdate = await contactToNlUpdate(contact, updates);
    if (!nlUpdate) {
      log.info("Ignoring contact update for " + contact.id);
      return;
    }

    try {
      log.info("Upsert contact " + contact.id);
      const nlContact = await this.provider.upsertContact(nlUpdate, oldEmail);

      log.info(
        `Got newsletter groups and status ${nlContact.status} for contact ${contact.id}`,
        { groups: nlContact.groups }
      );

      // TODO: remove dependency on ContactProfile
      await getRepository(ContactProfile).update(contact.id, {
        newsletterStatus: nlContact.status,
        newsletterGroups: nlContact.groups
      });
      contact.profile.newsletterStatus = nlContact.status;
      contact.profile.newsletterGroups = nlContact.groups;
    } catch (err) {
      // The newsletter provider rejected the update, set this contact's
      // newsletter status to None to prevent further updates
      if (err instanceof CantUpdateNewsletterContact) {
        log.error(
          `Newsletter upsert failed, setting status to none for contact ${contact.id}`,
          err
        );
        await getRepository(ContactProfile).update(contact.id, {
          newsletterStatus: NewsletterStatus.None
        });
        contact.profile.newsletterStatus = NewsletterStatus.None;
      } else {
        throw err;
      }
    }
  }

  /**
   * Upserts the list of contacts to the newsletter provider. This method is
   * used for bulk operations but unlike upsertContact does not give any
   * guarantees about the active member tag.
   *
   * @deprecated Only used by legacy app newsletter sync, do not use.
   * @param contacts
   */
  async upsertContacts(contacts: Contact[]): Promise<void> {
    log.info(`Upsert ${contacts.length} contacts`);
    await this.provider.upsertContacts(await getValidNlUpdates(contacts));
  }

  /**
   * Update the merge fields of a contact in the newsletter provider. This
   * method merges the field updates with the contact's current fields, so it
   * overwrites any existing fields with the new values, but does not remove any
   * fields that are not included in the update.
   *
   * @param contact The contact to update
   * @param fields The fields to set
   */
  async updateContactFields(
    contact: Contact,
    fields: Record<string, string>
  ): Promise<void> {
    log.info(`Update contact fields for ${contact.id}`, fields);
    const nlUpdate = await contactToNlUpdate(contact);
    if (nlUpdate) {
      await this.provider.updateContactFields(nlUpdate.email, fields);
    } else {
      log.info("Ignoring contact field update for " + contact.id);
    }
  }

  /**
   * Archive a list of contacts in the newsletter provider
   *
   * @param contacts The contacts to archive
   */
  async archiveContacts(contacts: Contact[]): Promise<void> {
    log.info(`Archive ${contacts.length} contacts`);
    await this.provider.archiveContacts(
      (await getValidNlUpdates(contacts)).map((m) => m.email)
    );
  }

  /**
   * Permanently remove contacts from the newsletter provider
   *
   * @param contacts The contacts to delete
   */
  async permanentlyDeleteContacts(contacts: Contact[]): Promise<void> {
    log.info(`Delete ${contacts.length} contacts`);
    await this.provider.permanentlyDeleteContacts(
      (await getValidNlUpdates(contacts)).map((m) => m.email)
    );
  }

  /**
   * Get a single newsletter contact from the newsletter provider
   *
   * @param email The contact's email address
   * @returns The newsletter contact
   */
  async getNewsletterContact(
    email: string
  ): Promise<NewsletterContact | undefined> {
    return await this.provider.getContact(email);
  }

  /**
   * Get all contacts from the newsletter provider
   *
   * @returns List of newsletter contacts
   */
  async getNewsletterContacts(): Promise<NewsletterContact[]> {
    return await this.provider.getContacts();
  }
}

export const newsletterService = new NewsletterService();
export default newsletterService;
