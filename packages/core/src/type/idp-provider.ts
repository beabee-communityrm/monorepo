import type { Contact } from '#models/index';

/**
 * Mirrors contacts to the external identity provider (IdP Provisioning) so
 * that they can be linked to IdP accounts by subject identifier
 */
export interface IdpProvider {
  /**
   * Create an account at the identity provider for a contact
   * @returns The subject identifier of the new account
   */
  createContact(contact: Contact): Promise<string>;
  /**
   * Find an existing account at the identity provider by email address
   * @returns The subject identifier, or null if not found
   */
  findSubjectByEmail(email: string): Promise<string | null>;
  /**
   * Update a linked account so it keeps mirroring the contact. The provider
   * decides which updates are relevant to it.
   * @param subject The linked account's subject identifier
   * @param contact The contact, with the updates already applied
   * @param updates The updates that were applied
   */
  updateContact(
    subject: string,
    contact: Contact,
    updates: Partial<Contact>
  ): Promise<void>;
  /**
   * Permanently delete a linked account
   * @param subject The linked account's subject identifier
   */
  permanentlyDeleteContact(subject: string): Promise<void>;
}
