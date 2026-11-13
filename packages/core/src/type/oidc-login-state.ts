/**
 * Kept in the session between the redirect to the identity provider and the
 * callback, to validate the response
 */
export interface OidcLoginState {
  state: string;
  nonce: string;
  codeVerifier: string;
  /** Validated internal path or allowed return URL to continue to after login */
  next?: string | undefined;
  /** `login` made the IdP re-authenticate the member */
  prompt?: 'login' | undefined;
  /** The login came from a set or reset password link, which it uses up */
  resetFlow?: boolean | undefined;
}
