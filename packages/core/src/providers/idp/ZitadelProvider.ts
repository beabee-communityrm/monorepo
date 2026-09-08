import type { ZitadelIdpConfig } from '#config/config';
import type { IdpProvider, IdpUserData } from '#type/index';

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

  /** Zitadel requires non-empty names, beabee doesn't */
  private profile(data: IdpUserData): {
    givenName: string;
    familyName: string;
  } {
    return {
      givenName: data.firstname || data.email,
      familyName: data.lastname || '-',
    };
  }

  async createUser(data: IdpUserData): Promise<string> {
    const resp = await this.request<{ userId: string }>(
      'POST',
      '/v2/users/human',
      {
        username: data.email,
        profile: this.profile(data),
        email: { email: data.email, isVerified: true },
      }
    );
    if (!resp?.userId) {
      throw new Error('Zitadel did not return the new user ID');
    }
    return resp.userId;
  }

  async findUserByEmail(email: string): Promise<string | null> {
    const resp = await this.request<{ result?: { userId: string }[] }>(
      'POST',
      '/v2/users',
      {
        queries: [
          {
            emailQuery: {
              emailAddress: email,
              method: 'TEXT_QUERY_METHOD_EQUALS_IGNORE_CASE',
            },
          },
        ],
      }
    );
    const users = resp?.result || [];
    if (users.length > 1) {
      throw new Error(`Multiple Zitadel users match ${email}`);
    }
    return users[0]?.userId || null;
  }

  async updateUser(subject: string, data: IdpUserData): Promise<void> {
    await this.request('PUT', `/v2/users/human/${subject}`, {
      username: data.email,
      profile: this.profile(data),
      email: { email: data.email, isVerified: true },
    });
  }

  async deleteUser(subject: string): Promise<void> {
    await this.request('DELETE', `/v2/users/${subject}`);
  }
}
