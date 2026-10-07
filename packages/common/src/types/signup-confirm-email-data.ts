/**
 * Result of confirming a signup email
 */
export interface SignupConfirmEmailData {
  /**
   * Where the member sets up their login at the identity provider, from
   * where they return logged in. Absent with local login, where the member
   * is logged in already.
   */
  credentialSetupUrl?: string;
}
