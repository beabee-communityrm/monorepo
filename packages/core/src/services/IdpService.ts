import config from '#config/config';
import { log as mainLogger } from '#logging';
import type { Contact } from '#models/index';
import {
  KeycloakProvider,
  NoneProvider,
  ZitadelProvider,
} from '#providers/idp/index';
import { imageService } from '#services/ImageService';
import { optionsService } from '#services/OptionsService';
import type { IdpProvider } from '#type/index';

const log = mainLogger.child({ app: 'idp-service' });

/**
 * IdP Provisioning: mirrors contacts to the identity provider. All methods
 * are best-effort — failures are logged for the operators but never thrown,
 * because contact management must keep working while the identity provider
 * is unreachable. Unlinked contacts are repaired with `user provision`.
 */
class IdpService {
  private readonly provider: IdpProvider =
    config.idp.provider === 'zitadel'
      ? new ZitadelProvider(config.idp.settings)
      : config.idp.provider === 'keycloak'
        ? new KeycloakProvider(config.idp.settings)
        : new NoneProvider();

  get isEnabled(): boolean {
    return config.idp.provider !== 'none';
  }

  /**
   * Create an account at the identity provider for a contact
   * @returns The subject identifier to link, or null if disabled or failed
   */
  async createContact(contact: Contact): Promise<string | null> {
    if (!this.isEnabled) return null;
    log.info('Create IdP account for contact ' + contact.id);
    try {
      return await this.provider.createContact(contact);
    } catch (err) {
      log.error(`Failed to create IdP account for ${contact.email}`, err);
      return null;
    }
  }

  /**
   * Update a linked contact's account so it keeps mirroring the contact
   * @param contact The contact, with the updates already applied
   * @param updates The updates that were applied
   */
  async updateContact(
    contact: Contact,
    updates: Partial<Contact>
  ): Promise<void> {
    if (!this.isEnabled || !contact.idpSubject) return;
    log.info('Update IdP account for contact ' + contact.id);
    try {
      await this.provider.updateContact(contact.idpSubject, contact, updates);
    } catch (err) {
      log.error(`Failed to update IdP account ${contact.idpSubject}`, err);
    }
  }

  /**
   * Permanently delete a linked contact's account
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    if (!this.isEnabled || !contact.idpSubject) return;
    log.info('Delete IdP account for contact ' + contact.id);
    try {
      await this.provider.permanentlyDeleteContact(contact.idpSubject);
    } catch (err) {
      log.error(`Failed to delete IdP account ${contact.idpSubject}`, err);
    }
  }

  /**
   * Apply the IdP-side settings beabee owns, then push the branding
   * @returns Whether everything was applied
   */
  async setup(): Promise<boolean> {
    if (!this.isEnabled) return false;
    log.info('Set up IdP');
    try {
      await this.provider.setup({
        defaultRedirectUri: `${config.audience}/api/1.0/auth/login`,
      });
    } catch (err) {
      log.error('Failed to set up IdP', err);
      return false;
    }
    return this.updateBranding();
  }

  /**
   * The logo option is the image's API path. Legacy uploads are skipped, as
   * re-uploading the logo in the settings is the way to migrate them.
   * Resized to stay under the IdP's asset size limit.
   */
  private async getLogo(): Promise<Blob | undefined> {
    const logo = optionsService.getText('logo');
    if (!logo) return undefined;
    const id = logo.match(/^images\/(.+)$/)?.[1];
    if (!id) {
      log.warn(`Skipping IdP logo, legacy image path: ${logo}`);
      return undefined;
    }
    const { buffer, contentType } = await imageService.getImageBuffer(id, 400);
    return new Blob([buffer], { type: contentType });
  }

  /**
   * Push the current theme and logo to the IdP's login pages
   * @returns Whether the branding was applied
   */
  async updateBranding(): Promise<boolean> {
    if (!this.isEnabled) return false;
    log.info('Update IdP branding');
    try {
      await this.provider.updateBranding({
        theme: optionsService.getJSON('theme'),
        logo: await this.getLogo(),
      });
      return true;
    } catch (err) {
      log.error('Failed to update IdP branding', err);
      return false;
    }
  }
}

export const idpService = new IdpService();
export default idpService;
