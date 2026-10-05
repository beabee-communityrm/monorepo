import type { Contact, ContactProfile } from '#models/index';

/**
 * Mirrors every contact to an external system. The provider is never the
 * source of truth: each upsert sends the contact's full current state.
 */
export interface ContactSyncProvider {
  /**
   * Create or update the external record for a contact. The provider decides
   * which updates are relevant to it and may skip the rest.
   * @param contact The contact, with its profile loaded and the updates applied
   * @param updates The updates that were applied, omitted for a new contact
   */
  upsertContact(
    contact: Contact,
    updates?: Partial<Contact> | Partial<ContactProfile>
  ): Promise<void>;
  /**
   * Permanently delete the external record for a contact
   */
  permanentlyDeleteContact(contact: Contact): Promise<void>;
}
