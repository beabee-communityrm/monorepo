import type { GetContactAuthMethodData } from '@beabee/beabee-common';
import { RoleTypes } from '@beabee/beabee-common';

import config from '#config/config';
import { getRepository } from '#database';
import { BadRequestError, NotFoundError } from '#errors/index';
import { LOGIN_URI, POST_LOGOUT_REDIRECT_URI, REDIRECT_URI } from '#lib/oidc';
import { log as mainLogger } from '#logging';
import { Contact } from '#models/index';
import {
  KeycloakProvider,
  NoneProvider,
  ZitadelProvider,
} from '#providers/idp/index';
import { imageService } from '#services/ImageService';
import { optionsService } from '#services/OptionsService';
import type { IdpLoginAction, IdpProvider } from '#type/index';

const log = mainLogger.child({ app: 'idp-service' });

// The token claim the website's edge reads, and the roles it can carry in
// order of precedence; admin roles never leave beabee
const ROLE_CLAIM = 'role';
const SITE_ROLES = RoleTypes.filter((r) => r !== 'admin' && r !== 'superadmin');

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
      const subject = await this.provider.createContact(contact);
      log.info(`Created IdP account ${subject} for contact ${contact.id}`);
      return subject;
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
        defaultRedirectUri: LOGIN_URI,
        ...(config.login.provider === 'oidc' && {
          oidcClient: {
            issuer: config.login.settings.issuer,
            clientId: config.login.settings.clientId,
            redirectUris: [REDIRECT_URI],
            postLogoutRedirectUris: [POST_LOGOUT_REDIRECT_URI],
          },
        }),
      });
    } catch (err) {
      log.error('Failed to set up IdP', err);
      return false;
    }
    return this.updateBranding();
  }

  /**
   * The claims the IdP adds to a token for a linked contact: the highest
   * active Site Login role, or nothing
   * @param subject The IdP subject the token is for
   */
  async getTokenClaims(subject: string): Promise<Record<string, string>> {
    const contact = await getRepository(Contact).findOneBy({
      idpSubject: subject,
    });
    const role = SITE_ROLES.find((r) => contact?.activeRoles.includes(r));
    return role ? { [ROLE_CLAIM]: role } : {};
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

  /**
   * The page to send a linked contact to for an action inside an OIDC login
   * that beabee started. Not best-effort like provisioning: the member is
   * waiting for it, so failures propagate.
   * @param authorizeUrl The authorization request beabee started
   */
  async resolveLoginUrl(
    authorizeUrl: string,
    contact: Contact,
    type: IdpLoginAction['type']
  ): Promise<string> {
    const subject = this.subjectOf(contact);
    log.info(`Resolve IdP login for ${type} of contact ${contact.id}`);
    return await this.provider.resolveLoginUrl(authorizeUrl, {
      type,
      subject,
    });
  }

  /**
   * The login methods a linked contact has at the identity provider. Not
   * best-effort: the member is waiting for it, so failures propagate.
   */
  async listAuthMethods(contact: Contact): Promise<GetContactAuthMethodData[]> {
    return await this.provider.listAuthMethods(this.subjectOf(contact));
  }

  /**
   * Remove one of a linked contact's login methods at the identity provider.
   * The password stays: it is the method the others are added on top of.
   * @param id The method's identifier from listAuthMethods
   */
  async removeAuthMethod(contact: Contact, id: string): Promise<void> {
    const method = (await this.listAuthMethods(contact)).find(
      (m) => m.id === id
    );
    if (!method) {
      throw new NotFoundError();
    }
    if (method.type === 'password') {
      throw new BadRequestError('The password cannot be removed');
    }
    log.info(`Remove ${method.type} ${id} of contact ${contact.id} at the IdP`);
    await this.provider.removeAuthMethod(this.subjectOf(contact), id);
  }

  private subjectOf(contact: Contact): string {
    if (!contact.idpSubject) {
      throw new Error(`Contact ${contact.id} has no IdP account`);
    }
    return contact.idpSubject;
  }
}

export const idpService = new IdpService();
export default idpService;
