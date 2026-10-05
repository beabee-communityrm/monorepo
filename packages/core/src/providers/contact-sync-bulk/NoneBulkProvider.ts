import type { ContactSyncBulkProvider, ContactSyncFailure } from '#type/index';

/**
 * Used when no contact sync is configured (BEABEE_CONTACTSYNC_PROVIDER=none)
 */
export class NoneBulkProvider implements ContactSyncBulkProvider {
  async upsertContacts(): Promise<ContactSyncFailure[]> {
    return [];
  }
}
