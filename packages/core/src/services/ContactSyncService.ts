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
 * unreachable. Each upsert sends the full state, so a missed update is
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
   * Create or update the external record for a contact
   * @param contact The contact, with the updates already applied
   */
  async upsertContact(contact: Contact): Promise<void> {
    if (!this.isEnabled) return;
    log.info('Sync contact ' + contact.id);
    try {
      if (!contact.profile) {
        contact.profile = await getRepository(ContactProfile).findOneByOrFail({
          contactId: contact.id,
        });
      }
      await this.provider.upsertContact(contact);
    } catch (err) {
      log.error(`Failed to sync contact ${contact.id}`, err);
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
}

export const contactSyncService = new ContactSyncService();
export default contactSyncService;
