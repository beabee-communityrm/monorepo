import type { LoginAction } from '@beabee/beabee-common';

/**
 * Something the member does at the identity provider inside an OIDC login
 * that beabee started, so that they return through the OIDC callback
 */
export interface IdpLoginAction {
  /**
   * The account actions, or setting up the first credential of a linked
   * account (Signup Flow), which only beabee itself starts
   */
  type: LoginAction | 'setupCredential';
  /** The linked account's subject identifier */
  subject: string;
}
