/**
 * Login methods a member can have at the identity provider, as beabee's
 * account page shows them
 */
export const CONTACT_AUTH_METHOD_TYPES = [
  'password',
  'passkey',
  'authenticatorApp',
  'securityKey',
] as const;
