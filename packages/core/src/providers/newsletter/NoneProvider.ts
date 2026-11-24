import {
  ApiHealthStatus,
  BaseNewsletterGroupData,
  NoneNewsletterIntegrationData,
} from '@beabee/beabee-common';

import type { Contact } from '#models/index';
import {
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact,
} from '#type/index';

export class NoneProvider implements NewsletterProvider {
  getContactKey(contact: Pick<Contact, 'id' | 'email'>): string {
    return contact.email;
  }
  async getContact(email: string): Promise<NewsletterContact | undefined> {
    return;
  }
  async upsertContact(
    contact: UpdateNewsletterContact,
    key: string,
    oldKey?: string
  ): Promise<NewsletterContact> {
    return {
      ...contact,
      groups: contact.groups ?? [],
      joined: new Date(),
      tags: [],
    };
  }
  async permanentlyDeleteContact(email: string): Promise<void> {}
  async updateContactFields(
    email: string,
    fields: Record<string, string>
  ): Promise<void> {}
  async updateContactTags(
    email: string,
    tags: Record<string, boolean>
  ): Promise<void> {}

  async getProviderInfo(
    withHealth = false
  ): Promise<NoneNewsletterIntegrationData> {
    return withHealth
      ? { provider: 'none', status: ApiHealthStatus.DISABLED }
      : { provider: 'none' };
  }

  async getGroups(): Promise<BaseNewsletterGroupData[]> {
    return [];
  }
}

/** @deprecated Use named import NoneProvider instead */
export default NoneProvider;
