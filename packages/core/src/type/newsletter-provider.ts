import { NewsletterContact } from "./newsletter-contact";
import { UpdateNewsletterContact } from "./update-newsletter-contact";

export interface NewsletterProvider {
  addTagToContacts(emails: string[], tag: string): Promise<void>;
  removeTagFromContacts(emails: string[], tag: string): Promise<void>;
  getContact(email: string): Promise<NewsletterContact | undefined>;
  getContacts(): Promise<NewsletterContact[]>;
  updateContact(
    contact: UpdateNewsletterContact,
    oldEmail?: string
  ): Promise<void>;
  upsertContacts(contacts: UpdateNewsletterContact[]): Promise<void>;
  archiveContacts(emails: string[]): Promise<void>;
  permanentlyDeleteContacts(emails: string[]): Promise<void>;
}
