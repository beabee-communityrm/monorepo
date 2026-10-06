import {
  ApiHealthStatus,
  NoneContactSyncIntegrationData,
} from '@beabee/beabee-common';

import type { ContactSyncProvider } from '#type/index';

/**
 * Used when no contact sync is configured (BEABEE_CONTACTSYNC_PROVIDER=none)
 */
export class NoneProvider implements ContactSyncProvider {
  async getProviderInfo(
    withHealth = false
  ): Promise<NoneContactSyncIntegrationData> {
    return withHealth
      ? { provider: 'none', status: ApiHealthStatus.DISABLED }
      : { provider: 'none' };
  }
  async createContact(): Promise<void> {}
  async updateContact(): Promise<void> {}
  async updateContactProfile(): Promise<void> {}
  async permanentlyDeleteContact(): Promise<void> {}
}
