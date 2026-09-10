import type { KeycloakIdpConfig } from '#config/config';
import { log as mainLogger } from '#logging';
import type { Contact } from '#models/index';
import type { IdpProvider } from '#type/index';

const log = mainLogger.child({ app: 'keycloak-idp-provider' });

/**
 * Mirrors contacts into a Keycloak realm via the admin REST API, authenticated
 * as a service account client (client credentials grant). Keycloak is the
 * local development IdP; accounts use the email address as username.
 */
export class KeycloakProvider implements IdpProvider {
  private accessToken = '';
  private tokenExpiresAt = 0;

  constructor(protected readonly settings: KeycloakIdpConfig['settings']) {}

  private async getAccessToken(): Promise<string> {
    if (Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    log.info('Fetch new Keycloak access token');
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

  async createContact(contact: Contact): Promise<string> {
    // Keycloak returns an empty 201 with the new user's URL in Location
    const resp = await this.request('POST', '/users', {
      username: contact.email,
      email: contact.email,
      firstName: contact.firstname,
      lastName: contact.lastname,
      enabled: true,
      emailVerified: true,
    });
    const subject = resp.headers.get('location')?.split('/').pop();
    if (!subject) {
      throw new Error('Keycloak did not return the new user location');
    }
    return subject;
  }

  async findSubjectByEmail(email: string): Promise<string | null> {
    const resp = await this.request(
      'GET',
      `/users?email=${encodeURIComponent(email)}&exact=true`
    );
    // Shape defined by the Keycloak admin API user representation
    const users = (await resp.json()) as { id: string }[];
    if (users.length > 1) {
      throw new Error(`Multiple Keycloak users match ${email}`);
    }
    return users[0]?.id || null;
  }

  async updateContact(
    subject: string,
    contact: Contact,
    updates: Partial<Contact>
  ): Promise<void> {
    if (updates.email || updates.firstname || updates.lastname) {
      await this.request('PUT', `/users/${subject}`, {
        username: contact.email,
        email: contact.email,
        firstName: contact.firstname,
        lastName: contact.lastname,
        emailVerified: true,
      });
    }
  }

  async permanentlyDeleteContact(subject: string): Promise<void> {
    await this.request('DELETE', `/users/${subject}`);
  }
}
