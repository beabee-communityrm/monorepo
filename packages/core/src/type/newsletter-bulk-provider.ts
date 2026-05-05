import type { NewsletterContact } from './newsletter-contact.js';
import type { NewsletterFetchContactsOpts } from './newsletter-fetch-contact-opts.js';
import type { UpdateNewsletterContact } from './update-newsletter-contact.js';

export interface NewsletterBulkProvider {
  updateContactTags(
    updates: { email: string; tags: { name: string; active: boolean }[] }[]
  ): Promise<void>;
  fetchContacts(
    opts?: NewsletterFetchContactsOpts
  ): Promise<NewsletterContact[]>;
  upsertContacts(contacts: UpdateNewsletterContact[]): Promise<void>;
  archiveContacts(emails: string[]): Promise<void>;
}
