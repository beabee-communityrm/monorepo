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
  async getGroups(
    contactId: string
  ): Promise<{ id: string; label: string }[]> {
    const { data } = await this.fetch.get<{ id: string; label: string }[]>(
      `/${contactId}/newsletter-groups`
    );
    return data;
  }
}
