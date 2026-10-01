/**
 * The identity provider answered the authorization request with an error,
 * typically because the member cancelled the login there
 */
export class OidcLoginDeniedError extends Error {
  constructor(
    readonly error: string,
    description?: string
  ) {
    super(
      `OIDC login denied by the identity provider: ${error}` +
        (description ? ` (${description})` : '')
    );
    Object.setPrototypeOf(this, OidcLoginDeniedError.prototype);
  }
}
