import type { Contact } from '#models/index';

import type { ContactSyncFailure } from './contact-sync-failure.js';

/**
 * Bulk counterpart of ContactSyncProvider, used to push many contacts at once
 * with far fewer requests than one call per contact
 */
export interface ContactSyncBulkProvider {
  /**
   * Create or update the external records for many contacts
   * @param contacts The contacts, with their profiles loaded
   * @returns The contacts the external system refused
   */
  upsertContacts(contacts: Contact[]): Promise<ContactSyncFailure[]>;
}
