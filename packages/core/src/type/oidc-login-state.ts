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
  /** A prompt=none refresh: the callback never shows an error, it continues to next */
  silent?: boolean;
}
