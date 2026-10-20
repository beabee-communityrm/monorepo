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
  /**
   * What the IdP was asked for: `none` is a silent refresh whose callback
   * never shows an error and continues to next, `login` re-authenticates
   * the member
   */
  prompt?: 'none' | 'login' | undefined;
}
