import config from '#config/config';
import { log as mainLogger } from '#logging';
import type { Contact } from '#models/index';
import { NoneProvider } from '#providers/idp/index';
import type { IdpProvider } from '#type/index';

const log = mainLogger.child({ app: 'idp-service' });

/**
 * IdP Provisioning: mirrors contacts to the identity provider. All methods
 * are best-effort — failures are logged for the operators but never thrown,
 * because contact management must keep working while the identity provider
 * is unreachable. Unlinked contacts are repaired with `user provision`.
 */
class IdpService {
  private readonly provider: IdpProvider = new NoneProvider();

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
   * Find an existing account at the identity provider by email address
   * @returns The subject identifier, or null if not found, disabled or failed
   */
  async findSubjectByEmail(email: string): Promise<string | null> {
    if (!this.isEnabled) return null;
    log.info('Find IdP account for ' + email);
    try {
      return await this.provider.findSubjectByEmail(email);
    } catch (err) {
      log.error(`Failed to find IdP account for ${email}`, err);
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
}

export const idpService = new IdpService();
export default idpService;
