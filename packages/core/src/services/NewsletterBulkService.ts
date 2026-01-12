import config from '#config/config';
import { getRepository } from '#database';
import { log as mainLogger } from '#logging';
import { Contact, ContactProfile } from '#models';
import {
  MailchimpBulkProvider,
  NoneBulkProvider,
} from '#providers/newsletter-bulk/index';
import {
  NewsletterBulkProvider,
  NewsletterContact,
  UpdateNewsletterContact,
} from '#type';
import { convertContactToNlUpdate } from '#utils/newsletter';

const log = mainLogger.child({ app: 'newsletter-bulk-service' });

/**
 * Convert a list of contacts to a list of newsletter updates that can be sent
 * to the newsletter provider, ignoring any contacts that shouldn't be synced
 *
 * @param contacts The list of contacts
 * @returns A list of valid newsletter updates
 */
function getValidNlUpdates(contacts: Contact[]): UpdateNewsletterContact[] {
  return contacts
    .map((c) => convertContactToNlUpdate(c))
    .filter((c) => c !== undefined);
}

class NewsletterBulkService {
  private readonly provider: NewsletterBulkProvider =
    config.newsletter.provider === 'mailchimp'
      ? new MailchimpBulkProvider(config.newsletter.settings)
      : new NoneBulkProvider();

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
    await this.provider.upsertContacts(getValidNlUpdates(contacts));
  }

  /**
   * Archive a list of contacts in the newsletter provider
   *
   * @param contacts The contacts to archive
   */
  async archiveContacts(contacts: Contact[]): Promise<void> {
    log.info(`Archive ${contacts.length} contacts`);
    await this.provider.archiveContacts(
      getValidNlUpdates(contacts).map((m) => m.email)
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

  async updateContactTags(
    updates: { email: string; tags: { name: string; active: boolean }[] }[]
  ): Promise<void> {
    log.info(`Update tags for ${updates.length} contacts`);
    await this.provider.updateContactTags(updates);
  }

  /**
   * Add the given tag to the list of contacts
   *
   * @param contacts List of contacts
   * @param tag The tag to add
   */
  async addTagToContacts(contacts: Contact[], tag: string): Promise<void> {
    log.info(`Add tag ${tag} to ${contacts.length} contacts`);
    await this.updateContactTags(
      getValidNlUpdates(contacts).map((m) => ({
        email: m.email,
        tags: [{ name: tag, active: true }],
      }))
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
    await this.updateContactTags(
      getValidNlUpdates(contacts).map((m) => ({
        email: m.email,
        tags: [{ name: tag, active: false }],
      }))
    );
  }

  /**
   * Update a list of contacts' newsletter status and groups, without syncing to
   * the newsletter provider
   *
   * @param contactUpdateRequests The contacts to update
   */
  async updateContactNlData(
    contactUpdateRequests: {
      contact: Contact;
      updates: Partial<
        Pick<ContactProfile, 'newsletterStatus' | 'newsletterGroups'>
      >;
    }[]
  ): Promise<void> {
    for (const { contact, updates } of contactUpdateRequests) {
      await getRepository(ContactProfile).update(contact.id, updates);
      if (contact.profile) {
        Object.assign(contact.profile, updates);
      }
    }
  }
}

export const newsletterBulkService = new NewsletterBulkService();
export default NewsletterBulkService;
