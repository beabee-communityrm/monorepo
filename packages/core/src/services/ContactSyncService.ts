import type { ContactSyncIntegrationData } from '@beabee/beabee-common';

import config from '#config/config';
import { getRepository } from '#database';
import { log as mainLogger } from '#logging';
import { Contact, ContactProfile } from '#models/index';
import {
  NoneProvider,
  SalesforceProvider,
} from '#providers/contact-sync/index';
import type { ContactSyncProvider } from '#type/index';

const log = mainLogger.child({ app: 'contact-sync-service' });

/**
 * Mirrors every contact to an external system, regardless of newsletter
 * status. All methods are best-effort: failures are logged but never thrown,
 * because contact management must keep working while the external system is
 * unreachable. Each write sends the full state, so a missed update is
 * repaired by the next one.
 */
class ContactSyncService {
  private readonly provider: ContactSyncProvider =
    config.contactSync.provider === 'salesforce'
      ? new SalesforceProvider(config.contactSync.settings)
      : new NoneProvider();

  get isEnabled(): boolean {
    return config.contactSync.provider !== 'none';
  }

  /**
   * Describe the configured provider, optionally with a live health check
   */
  async getProviderInfo(
    withHealth = false
  ): Promise<ContactSyncIntegrationData> {
    return this.provider.getProviderInfo(withHealth);
  }

  /**
   * Create the external record for a new contact
   */
  async createContact(contact: Contact): Promise<void> {
    if (!this.isEnabled) return;
    log.info('Sync new contact ' + contact.id);
    try {
      await this.provider.createContact(await this.withProfile(contact));
    } catch (err) {
      log.error(`Failed to sync new contact ${contact.id}`, err);
    }
  }

  /**
   * Update the external record after a contact update
   * @param contact The contact, with the updates already applied
   * @param updates The updates that were applied
   */
  async updateContact(
    contact: Contact,
    updates: Partial<Contact>
  ): Promise<void> {
    if (!this.isEnabled) return;
    log.info('Sync contact update ' + contact.id);
    try {
      await this.provider.updateContact(
        await this.withProfile(contact),
        updates
      );
    } catch (err) {
      log.error(`Failed to sync contact update ${contact.id}`, err);
    }
  }

  /**
   * Update the external record after a profile update
   * @param contact The contact, with the updates already applied
   * @param updates The updates that were applied
   */
  async updateContactProfile(
    contact: Contact,
    updates: Partial<ContactProfile>
  ): Promise<void> {
    if (!this.isEnabled) return;
    log.info('Sync profile update ' + contact.id);
    try {
      await this.provider.updateContactProfile(
        await this.withProfile(contact),
        updates
      );
    } catch (err) {
      log.error(`Failed to sync profile update ${contact.id}`, err);
    }
  }

  /**
   * Permanently delete the external record for a contact
   */
  async permanentlyDeleteContact(contact: Contact): Promise<void> {
    if (!this.isEnabled) return;
    log.info('Delete synced contact ' + contact.id);
    try {
      await this.provider.permanentlyDeleteContact(contact);
    } catch (err) {
      log.error(`Failed to delete synced contact ${contact.id}`, err);
    }
  }

  /** Providers read from the profile, which isn't always loaded */
  private async withProfile(contact: Contact): Promise<Contact> {
    if (!contact.profile) {
      contact.profile = await getRepository(ContactProfile).findOneByOrFail({
        contactId: contact.id,
      });
    }
    return contact;
  }
}

export const contactSyncService = new ContactSyncService();
export default contactSyncService;
