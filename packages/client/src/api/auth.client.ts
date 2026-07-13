import type { AuthInfoData } from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';
import { ContactClient } from './contact.client.js';

/**
 * Client for managing authentication operations
 * Login happens via the identity provider: navigate the browser to
 * `getLoginUrl()`, which starts the OIDC flow
 * @extends BaseClient
 */
export class AuthClient extends BaseClient {
  /**
   * Creates a new authentication client
   * @param options The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/auth'),
    });
  }

  /**
   * The URL that starts the OIDC login flow, for use in full-page navigation
   * @param next Optional internal path to redirect to after login
   */
  getLoginUrl(next?: string): string {
    return (
      cleanUrl(`${this.options.host}/${this.options.path}/auth/login`) +
      (next ? '?next=' + encodeURIComponent(next) : '')
    );
  }

  /**
   * The URL that logs the user out of beabee and the identity provider, for
   * use in full-page navigation
   */
  getLogoutUrl(): string {
    return cleanUrl(`${this.options.host}/${this.options.path}/auth/logout`);
  }

  /**
   * Gets the current authentication information
   * @returns Promise that resolves with the auth info
   */
  async info(): Promise<AuthInfoData> {
    const { data } = await this.fetch.get<AuthInfoData>('info', {
      credentials: 'include',
    });

    if (data.contact) {
      data.contact = ContactClient.deserialize(data.contact);
    }
    return data;
  }

  /**
   * Logs out the current user
   * Ends the user session without navigating through the identity provider,
   * for browser logout prefer a full-page navigation to `getLogoutUrl()`
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    await this.fetch.get('logout', undefined, {
      credentials: 'include',
      // The endpoint responds with a redirect to the identity provider
      redirect: 'manual',
    });
    // Clear stored cookies after logout
    this.fetch.clearCookies();
  }
}
