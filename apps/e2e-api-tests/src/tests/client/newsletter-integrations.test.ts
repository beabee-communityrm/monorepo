import {
  ApiHealthStatus,
  GetContactWith,
  NewsletterStatus,
} from '@beabee/beabee-common';
import { BeabeeClient } from '@beabee/client';
import { api, newsletterGroups, testUser } from '@beabee/test-utils/test-data';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const { kombucha: KOMBUCHA, tea: TEA, coffee: COFFEE } = newsletterGroups;

describe('Newsletter integrations API', () => {
  let client: BeabeeClient;
  let contactId: string;

  beforeAll(async () => {
    client = new BeabeeClient({
      host: api.host,
      path: api.path,
      token: testUser.apiKey,
    });

    // Configure the test newsletter provider's groups and sync the cache, so
    // this file doesn't depend on what the provider or other files left behind
    await client.fetch.post('/dev/newsletter-groups', [KOMBUCHA, TEA, COFFEE]);
    await client.integrations.refreshNewsletterGroups();

    // A contact subscribed to the group that gets removed below
    const contact = await client.contact.create({
      email: `nl-refresh-${Date.now()}@example.com`,
      firstname: 'Newsletter',
      lastname: 'Refresh',
    });
    contactId = contact.id;
    await client.contact.update(contactId, {
      profile: {
        newsletterStatus: NewsletterStatus.Subscribed,
        newsletterGroups: [KOMBUCHA.id, TEA.id, COFFEE.id],
      },
    });
  });

  afterAll(async () => {
    await client.contact.delete(contactId);
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
        const removedGroupId = COFFEE.id;

        await client.fetch.post('/dev/newsletter-groups', [
          KOMBUCHA,
          TEA,
          { id: 'd0g6ced973', label: 'Apfelschorle' },
        ]);

        // 1. Diff should compute that 1 group was added and 1 removed
        const { info, groupChanges } =
          await client.integrations.refreshNewsletterGroups();

        expect(groupChanges).toContainEqual(
          expect.objectContaining({ id: removedGroupId, action: 'removed' })
        );

        // 2. Database cache should be updated
        const updatedGroups = await client.integrations.getNewsletterGroups();
        expect(updatedGroups.map((g) => g.id).sort()).toEqual(
          [KOMBUCHA.id, TEA.id, 'd0g6ced973'].sort()
        );

        // 3. Deleted group should be removed from contact profile
        const contactProfile = await client.contact.get(contactId, [
          GetContactWith.Profile,
        ]);
        expect(contactProfile.profile.newsletterGroups.sort()).toEqual(
          [KOMBUCHA.id, TEA.id].sort()
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
