import type { ContactSyncProvider } from '#type/index';

/**
 * Used when no contact sync is configured (BEABEE_CONTACTSYNC_PROVIDER=none)
 */
export class NoneProvider implements ContactSyncProvider {
  async upsertContact(): Promise<void> {}
  async permanentlyDeleteContact(): Promise<void> {}
}
