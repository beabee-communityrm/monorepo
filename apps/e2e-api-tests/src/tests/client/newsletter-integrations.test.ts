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
        expect(providerInfo.provider).toBe('none');
      } catch (error) {
        throw error;
      }
    });
  });
});
