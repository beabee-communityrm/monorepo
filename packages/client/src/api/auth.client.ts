import type { AuthInfoData, LoginData } from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';
import { ContactClient } from './contact.client.js';

/**
 * Client for managing authentication operations
 * Handles login and logout
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
   * Authenticates a user with credentials
   * @param data Login credentials including email, password and optional 2FA token
   * @returns Promise that resolves when login is successful
   * @throws ClientApiError with code REQUIRES_2FA if 2FA is required
   */
  async login(data: LoginData): Promise<void> {
    await this.fetch.post(
      'login',
      {
        email: data.email,
        password: data.password,
        token: data.token,
      },
      {
        credentials: 'include',
      }
    );
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
   * Ends the user session and removes authentication
   * @returns Promise that resolves when logout is complete
   */
  async logout(): Promise<void> {
    await this.fetch.post('logout', undefined, {
      credentials: 'include',
    });
    // Clear stored cookies after logout
    this.fetch.clearCookies();
  }
}
