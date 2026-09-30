import type { LoginAction } from '@beabee/beabee-common';

import type { ZitadelIdpConfig } from '#config/config';
import type { Contact } from '#models/index';
import type { IdpLoginAction, IdpProvider } from '#type/index';

// Login v2 pages that work on the member's existing login session
const LOGIN_V2_PAGES: Record<LoginAction, string> = {
  changePassword: 'password/change',
  addPasskey: 'passkey/set',
  setupMfa: 'mfa/set',
};

/**
 * Mirrors contacts into a Zitadel virtual instance via the v2 user API,
 * authenticated with a service user's personal access token. Each beabee
 * instance has its own virtual instance, so accounts land in its default
 * organisation and no organisation pinning is needed.
 */
export class ZitadelProvider implements IdpProvider {
  constructor(protected readonly settings: ZitadelIdpConfig['settings']) {}

  private async request<T>(
    method: string,
    path: string,
    body?: object
  ): Promise<T | undefined> {
    const resp = await fetch(this.settings.url + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.settings.pat}`,
      },
      ...(body && { body: JSON.stringify(body) }),
    });
    const text = await resp.text();
    if (!resp.ok) {
      throw new Error(
        `Zitadel API error: ${method} ${path} returned ${resp.status}: ${text}`
      );
    }
    return text ? (JSON.parse(text) as T) : undefined;
  }

  /**
   * The human user payload sent on create and update. Zitadel requires
   * non-empty names (beabee doesn't) and only derives the display name on
   * creation, so both are always set explicitly.
   */
  private humanUser(contact: Contact) {
    return {
      username: contact.email,
      profile: {
        givenName: contact.firstname || contact.email,
        familyName: contact.lastname || '-',
        displayName:
          [contact.firstname, contact.lastname].filter(Boolean).join(' ') ||
          contact.email,
      },
      email: { email: contact.email, isVerified: true },
    };
  }

  async createContact(contact: Contact): Promise<string> {
    const resp = await this.request<{ userId: string }>(
      'POST',
      '/v2/users/human',
      this.humanUser(contact)
    );
    if (!resp?.userId) {
      throw new Error('Zitadel did not return the new user ID');
    }
    return resp.userId;
  }

  async updateContact(
    subject: string,
    contact: Contact,
    updates: Partial<Contact>
  ): Promise<void> {
    if (updates.email || updates.firstname || updates.lastname) {
      await this.request(
        'PUT',
        `/v2/users/human/${subject}`,
        this.humanUser(contact)
      );
    }
  }

  async permanentlyDeleteContact(subject: string): Promise<void> {
    await this.request('DELETE', `/v2/users/${subject}`);
  }

  /**
   * Every Login v2 page accepts the ID of an authorization request and
   * completes that request when the page is done, and identifies the
   * member's session by login name
   */
  async resolveLoginUrl(
    authorizeUrl: string,
    action: IdpLoginAction
  ): Promise<string> {
    const requestId = await this.startAuthRequest(authorizeUrl);

    // The invite verify page lets the member choose a password or passkey
    if (action.type === 'setupCredential') {
      const params = new URLSearchParams({
        requestId,
        userId: action.subject,
        code: await this.createInviteCode(action.subject),
        invite: 'true',
      });
      return `${this.settings.url}/ui/v2/login/verify?${params}`;
    }

    const params = new URLSearchParams({
      requestId,
      loginName: await this.getLoginName(action.subject),
    });
    return `${this.settings.url}/ui/v2/login/${LOGIN_V2_PAGES[action.type]}?${params}`;
  }

  /**
   * Zitadel creates the authorization request when the authorize endpoint
   * redirects to Login v2, so following the redirect once yields its ID:
   *
   *   > GET /oauth/v2/authorize?client_id=…&redirect_uri=…&state=…&code_challenge=…
   *   < 302 Location: /ui/v2/login/login?authRequest=V2_393061261941706295
   *
   * Login v2 pages take that ID as `requestId=oidc_V2_…` and complete the
   * request when done, sending the browser to our callback with the code.
   */
  private async startAuthRequest(authorizeUrl: string): Promise<string> {
    const resp = await fetch(authorizeUrl, { redirect: 'manual' });
    const location = resp.headers.get('location') || '';
    const authRequest = new URL(location, authorizeUrl).searchParams.get(
      'authRequest'
    );
    if (!authRequest) {
      throw new Error(
        `Zitadel did not start an authorization request: ${resp.status} ${location}`
      );
    }
    return `oidc_${authRequest}`;
  }

  private async createInviteCode(subject: string): Promise<string> {
    const resp = await this.request<{ inviteCode: string }>(
      'POST',
      `/v2/users/${subject}/invite_code`,
      { returnCode: {} }
    );
    if (!resp?.inviteCode) {
      throw new Error('Zitadel did not return the invite code');
    }
    return resp.inviteCode;
  }

  private async getLoginName(subject: string): Promise<string> {
    const resp = await this.request<{ user: { preferredLoginName: string } }>(
      'GET',
      `/v2/users/${subject}`
    );
    if (!resp?.user.preferredLoginName) {
      throw new Error('Zitadel did not return the login name');
    }
    return resp.user.preferredLoginName;
  }
}
