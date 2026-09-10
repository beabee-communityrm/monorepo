import type { ZitadelIdpConfig } from '#config/config';
import type { Contact } from '#models/index';
import type { IdpProvider } from '#type/index';

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

  async findSubjectByEmail(email: string): Promise<string | null> {
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
}
