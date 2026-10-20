import type { CONTACT_AUTH_METHOD_TYPES } from '../data/contact-auth-method-types.js';

export type ContactAuthMethodType = (typeof CONTACT_AUTH_METHOD_TYPES)[number];
