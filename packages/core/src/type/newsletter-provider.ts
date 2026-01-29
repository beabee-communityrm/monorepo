import { NewsletterContact } from './newsletter-contact';
import { UpdateNewsletterContact } from './update-newsletter-contact';

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
