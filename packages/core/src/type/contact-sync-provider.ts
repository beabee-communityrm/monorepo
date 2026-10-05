import type { Contact } from '#models/index';

/**
 * Mirrors every contact to an external system. The provider is never the
 * source of truth: each upsert sends the contact's full current state.
 */
export interface ContactSyncProvider {
  /**
   * Create or update the external record for a contact
   * @param contact The contact, with its profile loaded
   */
  upsertContact(contact: Contact): Promise<void>;
  /**
   * Permanently delete the external record for a contact
   */
  permanentlyDeleteContact(contact: Contact): Promise<void>;
}
