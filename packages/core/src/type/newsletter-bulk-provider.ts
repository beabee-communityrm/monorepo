import { NewsletterContact } from './newsletter-contact';
import { UpdateNewsletterContact } from './update-newsletter-contact';

export interface NewsletterBulkProvider {
  addTagToContacts(emails: string[], tag: string): Promise<void>;
  removeTagFromContacts(emails: string[], tag: string): Promise<void>;
  getContacts(): Promise<NewsletterContact[]>;
  upsertContacts(contacts: UpdateNewsletterContact[]): Promise<void>;
  archiveContacts(emails: string[]): Promise<void>;
}
