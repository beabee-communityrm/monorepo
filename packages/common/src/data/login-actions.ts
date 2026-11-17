/**
 * Actions inside an OIDC login, requested with the `action` parameter of
 * GET /auth/login. Most are something a member does at the identity
 * provider; `directLogin` logs a member in without showing them the
 * identity provider, and needs a Login Grant beabee issued for it.
 */
export const LOGIN_ACTIONS = [
  'changePassword',
  'addPasskey',
  'setupMfa',
  'setupCredential',
  'directLogin',
] as const;
