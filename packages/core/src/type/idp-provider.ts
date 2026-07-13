export interface IdpUserData {
  email: string;
  firstname: string;
  lastname: string;
}

/**
 * Provisions users at the external OIDC identity provider so contacts can be
 * linked to IdP accounts by subject identifier
 */
export interface IdpProvider {
  /**
   * Create a user at the identity provider
   * @returns The subject identifier of the new user, or null if provisioning is disabled
   */
  createUser(data: IdpUserData): Promise<string | null>;
  /**
   * Find an existing user at the identity provider by email address
   * @returns The subject identifier, or null if not found
   */
  findUserByEmail(email: string): Promise<string | null>;
  updateEmail(subject: string, email: string): Promise<void>;
  deleteUser(subject: string): Promise<void>;
}
