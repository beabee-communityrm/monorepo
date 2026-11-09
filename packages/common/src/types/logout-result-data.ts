/**
 * Result of logging out
 */
export interface LogoutResultData {
  /**
   * The identity provider's logout URL to send the browser to so that its
   * session ends as well, on OIDC Login instances
   */
  redirectUrl?: string;
}
