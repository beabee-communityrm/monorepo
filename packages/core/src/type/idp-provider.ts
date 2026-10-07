import type { ContentGeneralData } from '@beabee/beabee-common';

import type { Contact } from '#models/index';

import type { IdpLoginAction } from './idp-login-action.js';

/**
 * Mirrors contacts to the external identity provider (IdP Provisioning) so
 * that they can be linked to IdP accounts by subject identifier
 */
export interface IdpProvider {
  /**
   * Create an account at the identity provider for a contact
   * @returns The subject identifier of the new account
   */
  createContact(contact: Contact): Promise<string>;
  /**
   * Update a linked account so it keeps mirroring the contact. The provider
   * decides which updates are relevant to it.
   * @param subject The linked account's subject identifier
   * @param contact The contact, with the updates already applied
   * @param updates The updates that were applied
   */
  updateContact(
    subject: string,
    contact: Contact,
    updates: Partial<Contact>
  ): Promise<void>;
  /**
   * Permanently delete a linked account
   * @param subject The linked account's subject identifier
   */
  permanentlyDeleteContact(subject: string): Promise<void>;
  /**
   * Apply the instance settings beabee owns. Safe to repeat.
   */
  setup(settings: IdpSetupSettings): Promise<void>;
  /**
   * Push the beabee theme to the identity provider's login pages
   */
  updateBranding(branding: IdpBranding): Promise<void>;
  /**
   * The page to send the member to for an action inside an OIDC login that
   * beabee started. The member completes the action and the login there,
   * so they return through the OIDC callback like any login.
   * @param authorizeUrl The authorization request beabee started
   * @param action What the member does at the provider
   */
  resolveLoginUrl(
    authorizeUrl: string,
    action: IdpLoginAction
  ): Promise<string>;
}

export interface IdpSetupSettings {
  /** Where the IdP sends a member who finishes a Login v2 page outside a login beabee started */
  defaultRedirectUri: string;
}

export interface IdpBranding {
  theme: ContentGeneralData['theme'];
  /** Used as logo and icon, absent when the instance has no logo */
  logo?: Blob | undefined;
}
