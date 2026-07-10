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
        expect(newsletterGroups.length).not.toBe(0);
      } catch (error) {
        throw error;
      }
    });
    it('should refresh and remove groups', async () => {
      try {
        // const newsletterGroups = await client.refreshNewsletterGroups();
        // expect(newsletterGroups).toBeDefined();
      } catch (error) {
        throw error;
      }
    });
  });
});
