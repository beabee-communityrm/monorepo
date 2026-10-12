/**
 * Actions a member can do at the identity provider inside an OIDC login,
 * requested with the `action` parameter of GET /auth/login
 */
export const LOGIN_ACTIONS = [
  'changePassword',
  'addPasskey',
  'setupMfa',
] as const;
