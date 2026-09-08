/**
 * The contact fields mirrored to the identity provider
 */
export interface IdpUserData {
  email: string;
  firstname: string;
  lastname: string;
}

/**
 * Mirrors contacts to the external identity provider (IdP Provisioning) so
 * that they can be linked to IdP accounts by subject identifier
 */
export interface IdpProvider {
  /**
   * Create an account at the identity provider
   * @returns The subject identifier of the new account
   */
  createUser(data: IdpUserData): Promise<string>;
  /**
   * Find an existing account at the identity provider by email address
   * @returns The subject identifier, or null if not found
   */
  findUserByEmail(email: string): Promise<string | null>;
  /**
   * Update a linked account so it keeps mirroring the contact
   */
  updateUser(subject: string, data: IdpUserData): Promise<void>;
  /**
   * Delete a linked account
   */
  deleteUser(subject: string): Promise<void>;
}
