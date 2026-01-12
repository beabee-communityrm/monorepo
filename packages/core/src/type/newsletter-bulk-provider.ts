import { NewsletterContact } from './newsletter-contact';
import { NewsletterGetContactOpts } from './newsletter-get-contact-opts';
import { UpdateNewsletterContact } from './update-newsletter-contact';

export interface NewsletterBulkProvider {
  addTagToContacts(emails: string[], tag: string): Promise<void>;
  removeTagFromContacts(emails: string[], tag: string): Promise<void>;
  getContacts(opts?: NewsletterGetContactOpts): Promise<NewsletterContact[]>;
  upsertContacts(contacts: UpdateNewsletterContact[]): Promise<void>;
  archiveContacts(emails: string[]): Promise<void>;
}
