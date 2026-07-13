import config from '#config/config';
import { log as mainLogger } from '#logging';
import { NoneProvider, ZitadelProvider } from '#providers/idp/index';
import { IdpProvider, IdpUserData } from '#type/index';

const log = mainLogger.child({ app: 'idp-service' });

/**
 * Identity provider user provisioning service. All methods are best-effort:
 * failures are logged but never thrown, as contact management must keep
 * working while the identity provider is unreachable. Unlinked contacts can
 * be repaired later with the `user provision` CLI command.
 */
class IdpService {
  private readonly provider: IdpProvider =
    config.idp.provider === 'zitadel'
      ? new ZitadelProvider(config.idp.settings)
      : new NoneProvider();

  get isEnabled(): boolean {
    return config.idp.provider !== 'none';
  }

  /**
   * Create a user at the identity provider
   * @param data The user's email and name
   * @returns The IdP subject identifier to link, or null if disabled or failed
   */
  async createUser(data: IdpUserData): Promise<string | null> {
    try {
      return await this.provider.createUser(data);
    } catch (err) {
      log.error(`Failed to create IdP user for ${data.email}`, err);
      return null;
    }
  }

  /**
   * Find an existing user at the identity provider by email address
   * @returns The IdP subject identifier, or null if not found or failed
   */
  async findUserByEmail(email: string): Promise<string | null> {
    try {
      return await this.provider.findUserByEmail(email);
    } catch (err) {
      log.error(`Failed to find IdP user for ${email}`, err);
      return null;
    }
  }

  /**
   * Update a linked user's email address at the identity provider
   */
  async updateEmail(subject: string, email: string): Promise<void> {
    try {
      await this.provider.updateEmail(subject, email);
    } catch (err) {
      log.error(`Failed to update IdP email for subject ${subject}`, err);
    }
  }

  /**
   * Delete a linked user at the identity provider
   */
  async deleteUser(subject: string): Promise<void> {
    try {
      await this.provider.deleteUser(subject);
    } catch (err) {
      log.error(`Failed to delete IdP user for subject ${subject}`, err);
    }
  }
}

export const idpService = new IdpService();
export default idpService;
