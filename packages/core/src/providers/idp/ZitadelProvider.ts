import type { ZitadelIdpConfig } from '#config/config';
import type { Contact } from '#models/index';
import type { IdpBranding, IdpProvider, IdpSetupSettings } from '#type/index';

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

  // Zitadel rejects a policy update that changes nothing, but setup must be
  // re-runnable
  private async updatePolicy(path: string, body: object): Promise<void> {
    try {
      await this.request('PUT', path, body);
    } catch (err) {
      if (!(err instanceof Error && err.message.includes('NotChanged'))) {
        throw err;
      }
    }
  }

  private async uploadAsset(path: string, file: Blob): Promise<void> {
    const body = new FormData();
    body.append('file', file);
    const resp = await fetch(this.settings.url + path, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.settings.pat}` },
      body,
    });
    if (!resp.ok) {
      throw new Error(
        `Zitadel API error: POST ${path} returned ${resp.status}: ${await resp.text()}`
      );
    }
  }

  async setup(settings: IdpSetupSettings): Promise<void> {
    const resp = await this.request<{ policy: object }>(
      'GET',
      '/admin/v1/policies/login'
    );
    if (!resp?.policy) {
      throw new Error('Zitadel did not return the login policy');
    }
    await this.updatePolicy('/admin/v1/policies/login', {
      ...resp.policy,
      defaultRedirectUri: settings.defaultRedirectUri,
      ignoreUnknownUsernames: true,
    });
    await this.updatePolicy('/admin/v1/policies/notification', {
      passwordChange: false,
    });
  }

  async updateBranding(branding: IdpBranding): Promise<void> {
    const colors = branding.theme.colors || {};
    const primary = colors.main || colors.primary;
    await this.updatePolicy('/admin/v1/policies/label', {
      primaryColor: primary,
      primaryColorDark: primary,
      fontColor: colors.body,
      fontColorDark: colors.body,
      warnColor: colors.danger,
      warnColorDark: colors.danger,
      backgroundColor: colors.white,
      backgroundColorDark: colors.white,
      themeMode: 'THEME_MODE_LIGHT',
      hideLoginNameSuffix: true,
      disableWatermark: true,
    });
    if (branding.logo) {
      for (const asset of ['logo', 'logo/dark', 'icon', 'icon/dark']) {
        await this.uploadAsset(
          `/assets/v1/instance/policy/label/${asset}`,
          branding.logo
        );
      }
    }
    // Colours and assets stay in the preview until activated
    await this.request('POST', '/admin/v1/policies/label/_activate');
  }
}
