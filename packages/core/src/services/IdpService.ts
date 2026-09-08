import config from '#config/config';
import { log as mainLogger } from '#logging';
import { NoneProvider } from '#providers/idp/index';
import type { IdpProvider, IdpUserData } from '#type/index';

const log = mainLogger.child({ app: 'idp-service' });

/**
 * IdP Provisioning: mirrors contacts to the identity provider. All methods
 * are best-effort — failures are logged for the operators but never thrown,
 * because contact management must keep working while the identity provider
 * is unreachable. Unlinked contacts are repaired with `user provision`.
 */
class IdpService {
  private readonly provider: IdpProvider = new NoneProvider();

  get isEnabled(): boolean {
    return config.idp.provider !== 'none';
  }

  /**
   * Create an account at the identity provider for a contact
   * @returns The subject identifier to link, or null if disabled or failed
   */
  async createUser(data: IdpUserData): Promise<string | null> {
    if (!this.isEnabled) return null;
    try {
      return await this.provider.createUser(data);
    } catch (err) {
      log.error(`Failed to create IdP account for ${data.email}`, err);
      return null;
    }
  }

  /**
   * Find an existing account at the identity provider by email address
   * @returns The subject identifier, or null if not found, disabled or failed
   */
  async findUserByEmail(email: string): Promise<string | null> {
    if (!this.isEnabled) return null;
    try {
      return await this.provider.findUserByEmail(email);
    } catch (err) {
      log.error(`Failed to find IdP account for ${email}`, err);
      return null;
    }
  }

  /**
   * Update a linked account so it keeps mirroring the contact
   */
  async updateUser(subject: string, data: IdpUserData): Promise<void> {
    if (!this.isEnabled) return;
    try {
      await this.provider.updateUser(subject, data);
    } catch (err) {
      log.error(`Failed to update IdP account ${subject}`, err);
    }
  }

  /**
   * Delete a linked account
   */
  async deleteUser(subject: string): Promise<void> {
    if (!this.isEnabled) return;
    try {
      await this.provider.deleteUser(subject);
    } catch (err) {
      log.error(`Failed to delete IdP account ${subject}`, err);
    }
  }
}

export const idpService = new IdpService();
export default idpService;
