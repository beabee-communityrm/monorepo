import type { Contact, ContactProfile } from '#models/index';

/**
 * Mirrors every contact to an external system. The provider is never the
 * source of truth: each write sends the contact's full current state. The
 * provider decides which updates are relevant to it and may skip the rest.
 */
export interface ContactSyncProvider {
  /**
   * Create the external record for a new contact
   * @param contact The contact, with its profile loaded
   */
  createContact(contact: Contact): Promise<void>;
  /**
   * Update the external record after a contact update
   * @param contact The contact, with its profile loaded and the updates applied
   * @param updates The updates that were applied
   */
  updateContact(contact: Contact, updates: Partial<Contact>): Promise<void>;
  /**
   * Update the external record after a profile update
   * @param contact The contact, with its profile loaded and the updates applied
   * @param updates The updates that were applied
   */
  updateContactProfile(
    contact: Contact,
    updates: Partial<ContactProfile>
  ): Promise<void>;
  /**
   * Permanently delete the external record for a contact
   */
  permanentlyDeleteContact(contact: Contact): Promise<void>;
}
