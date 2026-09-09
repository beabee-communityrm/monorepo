import type { BaseNewsletterGroupData } from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing contact newsletter group operations.
 */
export class ContactNewsletterClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/contact'),
    });
  }

  /**
   * Get the newsletter groups a contact is currently subscribed to.
   * @param contactId - The ID of the contact.
   * @returns The groups the contact is subscribed to.
   */
  async getGroups(contactId: string): Promise<BaseNewsletterGroupData[]> {
    const { data } = await this.fetch.get<BaseNewsletterGroupData[]>(
      `/${contactId}/newsletter-groups`
    );
    return data;
  }

  /**
   * Unsubscribe a contact from a single newsletter group.
   * @param contactId - The ID of the contact.
   * @param groupId - The ID of the newsletter group to unsubscribe from.
   */
  async unsubscribe(contactId: string, groupId: string): Promise<void> {
    await this.fetch.delete(`/${contactId}/newsletter-groups/${groupId}`);
  }
}
