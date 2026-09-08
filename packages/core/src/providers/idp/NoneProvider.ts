import type { IdpProvider } from '#type/index';

/**
 * Used when no identity provider is configured (BEABEE_IDP_PROVIDER=none)
 */
export class NoneProvider implements IdpProvider {
  async createUser(): Promise<string> {
    throw new Error('No identity provider configured');
  }
  async findUserByEmail(): Promise<string | null> {
    return null;
  }
  async updateUser(): Promise<void> {}
  async deleteUser(): Promise<void> {}
}
