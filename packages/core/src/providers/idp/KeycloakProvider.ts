import type { KeycloakIdpConfig } from '#config/config';
import { IdpProvider, IdpUserData } from '#type/index';

/**
 * Provisions users in a Keycloak realm via the admin REST API, authenticated
 * with a service account client (client credentials grant)
 */
export class KeycloakProvider implements IdpProvider {
  private accessToken = '';
  private tokenExpiresAt = 0;

  constructor(protected readonly settings: KeycloakIdpConfig['settings']) {}

  private async getAccessToken(): Promise<string> {
    if (Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const resp = await fetch(
      `${this.settings.url}/realms/${this.settings.realm}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.settings.clientId,
          client_secret: this.settings.clientSecret,
        }),
      }
    );
    if (!resp.ok) {
      throw new Error(
        `Keycloak token error: ${resp.status}: ${await resp.text()}`
      );
    }

    // Shape defined by the OAuth 2.0 token endpoint specification
    const data = (await resp.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 30) * 1000;
    return this.accessToken;
  }

  private async request(
    method: string,
    path: string,
    body?: object
  ): Promise<Response> {
    const resp = await fetch(
      `${this.settings.url}/admin/realms/${this.settings.realm}${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await this.getAccessToken()}`,
        },
        ...(body && { body: JSON.stringify(body) }),
      }
    );
    if (!resp.ok) {
      throw new Error(
        `Keycloak API error: ${method} ${path} returned ${resp.status}: ${await resp.text()}`
      );
    }
    return resp;
  }

  async createUser(data: IdpUserData): Promise<string | null> {
    // Keycloak returns an empty 201 with the new user's URL in Location
    const resp = await this.request('POST', '/users', {
      username: data.email,
      email: data.email,
      firstName: data.firstname,
      lastName: data.lastname,
      enabled: true,
      emailVerified: true,
    });
    return resp.headers.get('location')?.split('/').pop() || null;
  }

  async findUserByEmail(email: string): Promise<string | null> {
    const resp = await this.request(
      'GET',
      `/users?email=${encodeURIComponent(email)}&exact=true`
    );
    // Shape defined by the Keycloak admin API user representation
    const users = (await resp.json()) as { id: string }[];
    return users[0]?.id || null;
  }

  async updateEmail(subject: string, email: string): Promise<void> {
    // Username follows the email as beabee uses email-as-username
    await this.request('PUT', `/users/${subject}`, {
      username: email,
      email,
      emailVerified: true,
    });
  }

  async deleteUser(subject: string): Promise<void> {
    await this.request('DELETE', `/users/${subject}`);
  }
}
