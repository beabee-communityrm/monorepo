import type {
  AuthInfoData,
  LoginAction,
  LoginData,
  LogoutResultData,
} from '@beabee/beabee-common';

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
   * The URL that starts OIDC login, for full-page navigation on instances
   * where members log in at the identity provider
   * @param next Internal path to continue to after login
   * @param action What the logged-in member does at the identity provider
   * inside this login, e.g. change their password
   */
  getLoginUrl(next?: string, action?: LoginAction): string {
    const url = this.authUrl('login');
    if (next) {
      url.searchParams.set('next', next);
    }
    if (action) {
      url.searchParams.set('action', action);
    }
    return url.href;
  }

  /**
   * The URL that logs the member out of beabee and the identity provider,
   * for full-page navigation on OIDC Login instances
   */
  getLogoutUrl(): string {
    return this.authUrl('logout').href;
  }

  /**
   * Absolute URL of an auth endpoint, resolved against the host the same way
   * requests are. `this.options` holds the options as passed in, without the
   * `/auth` segment the constructor adds for requests.
   */
  private authUrl(endpoint: string): URL {
    return new URL(
      cleanUrl(`${this.options.path}/auth/${endpoint}`),
      this.options.host
    );
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
   * @returns Where to send the browser next, if the identity provider's
   * session has to be ended too
   */
  async logout(): Promise<LogoutResultData> {
    const { data } = await this.fetch.post<LogoutResultData | undefined>(
      'logout',
      undefined,
      { credentials: 'include' }
    );
    // Clear stored cookies after logout
    this.fetch.clearCookies();
    return data || {};
  }
}
