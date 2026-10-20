import type { GetContactAuthMethodData } from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for a contact's login methods at the identity provider
 */
export class ContactAuthMethodClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/contact'),
    });
  }

  /**
   * List the login methods a contact has set up
   * @param contactId - The ID of the contact, or `me`
   */
  async list(contactId: string): Promise<GetContactAuthMethodData[]> {
    const { data } = await this.fetch.get<GetContactAuthMethodData[]>(
      `/${contactId}/auth-methods`
    );
    return data;
  }

  /**
   * Remove one of a contact's login methods. For `me` this needs a fresh
   * login at the identity provider, otherwise it fails with
   * `fresh-login-required`.
   * @param contactId - The ID of the contact, or `me`
   * @param id - The method's ID from `list`
   */
  async delete(contactId: string, id: string): Promise<void> {
    await this.fetch.delete(`/${contactId}/auth-methods/${id}`);
  }
}
