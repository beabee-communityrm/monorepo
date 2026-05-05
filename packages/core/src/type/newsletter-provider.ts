import type { NewsletterContact } from './newsletter-contact.js';
import type { UpdateNewsletterContact } from './update-newsletter-contact.js';

export interface NewsletterProvider {
  getContact(email: string): Promise<NewsletterContact | undefined>;
  upsertContact(
    contact: UpdateNewsletterContact,
    oldEmail?: string
  ): Promise<NewsletterContact>;
  updateContactTags(
    email: string,
    tags: Record<string, boolean>
  ): Promise<void>;
  updateContactFields(
    email: string,
    fields: Record<string, string>
  ): Promise<void>;
  permanentlyDeleteContact(email: string): Promise<void>;
}
