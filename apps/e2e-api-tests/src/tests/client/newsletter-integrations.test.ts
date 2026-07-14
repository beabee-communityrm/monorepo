import { ApiHealthStatus, GetContactWith } from '@beabee/beabee-common';
import { BeabeeClient } from '@beabee/client';
import {
  api,
  rateLimitedTestUser,
  testUser,
} from '@beabee/test-utils/test-data';

import { beforeAll, describe, expect, it } from 'vitest';

describe('Newsletter integrations API', () => {
  let client: BeabeeClient;

  beforeAll(() => {
    client = new BeabeeClient({
      host: api.host,
      path: api.path,
      token: testUser.apiKey,
    });
  });

  describe('Provider Info', () => {
    it('should return newsletter provider info', async () => {
      try {
        const providerInfo = await client.integrations.getNewsletter([
          'health',
        ]);
        expect(providerInfo).toBeDefined();
        expect(providerInfo.provider).toBe('test');
        expect(providerInfo.status).toBe(ApiHealthStatus.HEALTHY);
      } catch (error) {
        throw error;
      }
    });
    it('should get cached newsletter groups', async () => {
      try {
        const newsletterGroups =
          await client.integrations.getNewsletterGroups();
        expect(newsletterGroups).toBeDefined();
        expect(newsletterGroups).not.toHaveLength(0);
      } catch (error) {
        throw error;
      }
    });
    it('should refresh and remove groups', async () => {
      try {
        const removedGroupId = '7bd89a737b';
        // 1. Diff should compute that 1 group was added and 1 removed
        const { info, groupChanges } =
          await client.integrations.refreshNewsletterGroups();

        expect(groupChanges).toContainEqual(
          expect.objectContaining({ id: removedGroupId, action: 'removed' })
        );

        // 2. Database cache should be updated
        const updatedGroups = await client.integrations.getNewsletterGroups();
        expect(updatedGroups.map((g) => g.id).sort()).toEqual(
          ['b8e4acb751', 'c0b1a133d1', 'd0g6ced973'].sort()
        );

        // 3. Deleted group should be removed from contact profile
        const contactProfile = await client.contact.get(
          rateLimitedTestUser.contactId,
          [GetContactWith.Profile]
        );
        expect(contactProfile.profile.newsletterGroups).not.toContain(
          removedGroupId
        );

        // 4. Deleted group should be removed from join/setup
        const joinSetup = await client.content.get('join/setup');
        expect(joinSetup.newsletterGroups.map((g) => g.id)).not.toContain(
          removedGroupId
        );
      } catch (error) {
        throw error;
      }
    });
  });
});
