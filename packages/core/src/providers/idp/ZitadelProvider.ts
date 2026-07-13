import type { ZitadelIdpConfig } from '#config/config';
import { IdpProvider, IdpUserData } from '#type/index';

/**
 * Provisions users in a Zitadel instance via the v2 user management API,
 * authenticated with a service user personal access token
 */
export class ZitadelProvider implements IdpProvider {
  constructor(protected readonly settings: ZitadelIdpConfig['settings']) {}

  private async request(
    method: string,
    path: string,
    body?: object
  ): Promise<any> {
    const resp = await fetch(this.settings.url + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.settings.pat}`,
      },
      ...(body && { body: JSON.stringify(body) }),
    });
    if (!resp.ok) {
      throw new Error(
        `Zitadel API error: ${method} ${path} returned ${resp.status}: ${await resp.text()}`
      );
    }
    return await resp.json();
  }

  async createUser(data: IdpUserData): Promise<string | null> {
    const resp = await this.request('POST', '/v2/users/human', {
      username: data.email,
      profile: {
        // Zitadel requires non-empty names
        givenName: data.firstname || data.email,
        familyName: data.lastname || '-',
      },
      email: {
        email: data.email,
        isVerified: true,
      },
    });
    return resp.userId;
  }

  async findUserByEmail(email: string): Promise<string | null> {
    const resp = await this.request('POST', '/v2/users', {
      queries: [
        {
          emailQuery: {
            emailAddress: email,
            method: 'TEXT_QUERY_METHOD_EQUALS_IGNORE_CASE',
          },
        },
      ],
    });
    return resp.result?.[0]?.userId || null;
  }

  async updateEmail(subject: string, email: string): Promise<void> {
    await this.request('POST', `/v2/users/${subject}/email`, {
      email,
      isVerified: true,
    });
  }

  async deleteUser(subject: string): Promise<void> {
    await this.request('DELETE', `/v2/users/${subject}`);
  }
}
