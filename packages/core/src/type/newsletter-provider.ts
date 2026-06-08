import { NewsletterIntegrationData } from '@beabee/beabee-common';

import { NewsletterContact } from './newsletter-contact.js';
import { UpdateNewsletterContact } from './update-newsletter-contact.js';

export interface NewsletterProvider {
  getProviderInfo(): Promise<NewsletterIntegrationData>;
  refreshGroups(): Promise<{ id: string; label: string }[]>;
  getContact(email: string): Promise<NewsletterContact | undefined>;
  getGroups(): Promise<{ id: string; label: string }[]>;
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
