import { ApiHealthStatus } from '@beabee/beabee-common';
import { IntegrationsClient } from '@beabee/client';
import { api, testUser } from '@beabee/test-utils/test-data';

import { beforeAll, describe, expect, it } from 'vitest';

describe('Newsletter integrations API', () => {
  let client: IntegrationsClient;

  beforeAll(() => {
    client = new IntegrationsClient({
      host: api.host,
      path: api.path,
      token: testUser.apiKey,
    });
  });

  describe('Provider Info', () => {
    it('should return newsletter provider info', async () => {
      try {
        const providerInfo = await client.getNewsletter(['health']);
        expect(providerInfo).toBeDefined();
        expect(providerInfo.provider).toBe('test');
        expect(providerInfo.status).toBe(ApiHealthStatus.HEALTHY);
      } catch (error) {
        throw error;
      }
    });
    it('should get cached newsletter groups', async () => {
      try {
        const newsletterGroups = await client.getNewsletterGroups();
        expect(newsletterGroups).toBeDefined();
        expect(newsletterGroups).not.toHaveLength(0);
      } catch (error) {
        throw error;
      }
    });
    it('should refresh and remove groups', async () => {
      try {
        const { info, groupChanges } = await client.refreshNewsletterGroups();
        expect(groupChanges.filter((g) => g.action === 'added')).toHaveLength(
          1
        );
        expect(groupChanges.filter((g) => g.action === 'removed')).toHaveLength(
          1
        );

        // Verify that cache was updated
        const updatedGroups = await client.getNewsletterGroups();
        expect(updatedGroups.map((g) => g.id).sort()).toEqual(
          ['b8e4acb751', 'c0b1a133d1', 'd0g6ced973'].sort()
        );
      } catch (error) {
        throw error;
      }
    });
  });
});
