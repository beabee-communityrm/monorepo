import type { LoginAction } from '@beabee/beabee-common';

/**
 * Something the member does at the identity provider inside an OIDC login
 * that beabee started, so that they return through the OIDC callback
 */
export interface IdpLoginAction {
  type: LoginAction;
  /** The linked account's subject identifier */
  subject: string;
}
