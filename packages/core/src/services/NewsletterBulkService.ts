import config from '#config/config';
import { getRepository } from '#database';
import { log as mainLogger } from '#logging';
import { Contact, ContactProfile } from '#models';
import { MailchimpProvider, NoneProvider } from '#providers/newsletter';
import { NewsletterContact } from '#type/newsletter-contact';
import { NewsletterProvider } from '#type/newsletter-provider';
import { UpdateNewsletterContact } from '#type/update-newsletter-contact';

import { contactToNlUpdate } from './NewsletterService';

const log = mainLogger.child({ app: 'newsletter-bulk-service' });

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

class NewsletterBulkService {
  private readonly provider: NewsletterProvider =
    config.newsletter.provider === 'mailchimp'
      ? new MailchimpProvider(config.newsletter.settings)
      : new NoneProvider();

  /**
   * Upserts the list of contacts to the newsletter provider. Unlike
   * NewsletterService.upsertContact, this syncs the basic contact information
   * only, associated data such as the active member tag should be handled
   * separately.
   *
   * @param contacts The contacts to upsert
   */
  async upsertContacts(contacts: Contact[]): Promise<void> {
    log.info(`Upsert ${contacts.length} contacts`);
    await this.provider.upsertContacts(await getValidNlUpdates(contacts));
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
   * Get all contacts from the newsletter provider
   *
   * @returns List of newsletter contacts
   */
  async getNewsletterContacts(): Promise<NewsletterContact[]> {
    return await this.provider.getContacts();
  }

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
   * Update a contact's newsletter status and groups, without syncing to the
   * newsletter provider
   *
   * @param contact The contact to update
   * @param newsletterStatus The new newsletter status
   * @param newsletterGroups The new newsletter groups
   */
  async updateContactStatuses(
    updates: [Contact, NewsletterContact][]
  ): Promise<void> {
    for (const [contact, nlContact] of updates) {
      await getRepository(ContactProfile).update(contact.id, {
        newsletterStatus: nlContact.status,
        newsletterGroups: nlContact.groups,
      });
      if (contact.profile) {
        contact.profile.newsletterStatus = nlContact.status;
        contact.profile.newsletterGroups = nlContact.groups;
      }
    }
  }
}

export const newsletterBulkService = new NewsletterBulkService();
export default NewsletterBulkService;
