import type { IdpProvider } from '#type/index';

/**
 * Used when no identity provider is configured (BEABEE_IDP_PROVIDER=none)
 */
export class NoneProvider implements IdpProvider {
  async createContact(): Promise<string> {
    throw new Error('No identity provider configured');
  }
  async updateContact(): Promise<void> {}
  async permanentlyDeleteContact(): Promise<void> {}
  async setup(): Promise<void> {
    throw new Error('No identity provider configured');
  }
  async updateBranding(): Promise<void> {
    throw new Error('No identity provider configured');
  }
  async resolveLoginUrl(): Promise<never> {
    throw new Error('No identity provider configured');
  }
}
