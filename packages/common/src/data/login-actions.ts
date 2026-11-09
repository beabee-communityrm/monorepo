/**
 * Actions a member can do at the identity provider inside an OIDC login,
 * requested with the `action` parameter of GET /auth/login. Setting up the
 * first credential of a new account is how the Signup Flow continues.
 */
export const LOGIN_ACTIONS = [
  'changePassword',
  'addPasskey',
  'setupMfa',
  'setupCredential',
] as const;
