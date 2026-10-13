import type { GetContactAuthMethodData } from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for the current member's login methods at the identity provider
 */
export class ContactAuthMethodClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/contact/me/auth-methods'),
    });
  }

  /**
   * List the login methods the current member has set up
   */
  async list(): Promise<GetContactAuthMethodData[]> {
    const { data } = await this.fetch.get<GetContactAuthMethodData[]>('/');
    return data;
  }

  /**
   * Remove one of the current member's login methods. Requires a fresh login
   * at the identity provider, otherwise fails with `fresh-login-required`.
   * @param id - The method's ID from `list`
   */
  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }
}
