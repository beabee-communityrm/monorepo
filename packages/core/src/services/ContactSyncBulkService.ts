import config from '#config/config';
import { log as mainLogger } from '#logging';
import type { Contact } from '#models/index';
import {
  NoneBulkProvider,
  SalesforceBulkProvider,
} from '#providers/contact-sync-bulk/index';
import type { ContactSyncBulkProvider, ContactSyncFailure } from '#type/index';

const log = mainLogger.child({ app: 'contact-sync-bulk-service' });

/**
 * Bulk counterpart of ContactSyncService for backfills and repairs. Unlike
 * the single-contact service this reports failures instead of swallowing
 * them, because its callers are operators who need to see them.
 */
class ContactSyncBulkService {
  private readonly provider: ContactSyncBulkProvider =
    config.contactSync.provider === 'salesforce'
      ? new SalesforceBulkProvider(config.contactSync.settings)
      : new NoneBulkProvider();

  get isEnabled(): boolean {
    return config.contactSync.provider !== 'none';
  }

  /**
   * Create or update the external records for many contacts
   * @param contacts The contacts, with their profiles loaded
   * @returns The contacts the external system refused
   */
  async upsertContacts(contacts: Contact[]): Promise<ContactSyncFailure[]> {
    log.info(`Upsert ${contacts.length} contacts`);
    return this.provider.upsertContacts(contacts);
  }
}

export const contactSyncBulkService = new ContactSyncBulkService();
export default contactSyncBulkService;
