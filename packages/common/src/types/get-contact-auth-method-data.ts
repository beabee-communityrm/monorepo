import type { ContactAuthMethodType } from './contact-auth-method-type.js';

/**
 * A login method a member has set up at the identity provider
 */
export interface GetContactAuthMethodData {
  /** Identifier the provider accepts for removal */
  id: string;
  type: ContactAuthMethodType;
  /** Name the member gave the method, where the provider keeps one */
  name?: string;
}
