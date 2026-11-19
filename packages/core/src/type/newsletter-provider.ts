import {
  BaseNewsletterGroupData,
  NewsletterIntegrationData,
} from '@beabee/beabee-common';

import type { Contact } from '#models/index';

import { NewsletterContact } from './newsletter-contact.js';
import { UpdateNewsletterContact } from './update-newsletter-contact.js';

export interface NewsletterProvider {
  /** The key the provider addresses a contact by, e.g. their email address */
  getContactKey(contact: Pick<Contact, 'id' | 'email'>): string;
  getProviderInfo(withHealth?: boolean): Promise<NewsletterIntegrationData>;
  getContact(key: string): Promise<NewsletterContact | undefined>;
  getGroups(): Promise<BaseNewsletterGroupData[]>;
  upsertContact(
    contact: UpdateNewsletterContact,
    key: string,
    oldKey?: string
  ): Promise<NewsletterContact>;
  updateContactTags(key: string, tags: Record<string, boolean>): Promise<void>;
  updateContactFields(
    key: string,
    fields: Record<string, string>
  ): Promise<void>;
  permanentlyDeleteContact(key: string): Promise<void>;
}
