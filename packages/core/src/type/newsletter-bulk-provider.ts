import { NewsletterContact } from './newsletter-contact';
import { UpdateNewsletterContact } from './update-newsletter-contact';

export interface NewsletterBulkProvider {
  updateContactTags(
    updates: { email: string; tags: { name: string; active: boolean }[] }[]
  ): Promise<void>;
  getContacts(): Promise<NewsletterContact[]>;
  upsertContacts(contacts: UpdateNewsletterContact[]): Promise<void>;
  archiveContacts(emails: string[]): Promise<void>;
}
