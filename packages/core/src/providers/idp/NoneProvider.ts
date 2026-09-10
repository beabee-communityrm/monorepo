import type { IdpProvider } from '#type/index';

/**
 * Used when no identity provider is configured (BEABEE_IDP_PROVIDER=none)
 */
export class NoneProvider implements IdpProvider {
  async createContact(): Promise<string> {
    throw new Error('No identity provider configured');
  }
  async findSubjectByEmail(): Promise<string | null> {
    return null;
  }
  async updateContact(): Promise<void> {}
  async permanentlyDeleteContact(): Promise<void> {}
}
