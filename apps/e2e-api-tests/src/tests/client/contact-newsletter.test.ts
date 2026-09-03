import { GetContactWith, NewsletterStatus } from '@beabee/beabee-common';
import { BeabeeClient } from '@beabee/client';
import { api, testUser } from '@beabee/test-utils/test-data';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  createTestCallout,
  createTestCalloutResponseAnswers,
} from '../../fixtures/callouts.js';

// Groups provided by the test newsletter provider. Coffee is deliberately
// left out because the newsletter integrations test removes it.
const KOMBUCHA = { id: 'b8e4acb751', label: 'Kombucha' };
const TEA = { id: 'c0b1a133d1', label: 'Tea' };

const PASSWORD = 'testPassword123!';

interface TestMember {
  id: string;
  client: BeabeeClient;
}

describe('Contact newsletter groups API', () => {
  let admin: BeabeeClient;
  let member: TestMember;
  let unsubscribedMember: TestMember;
  const createdContactIds: string[] = [];
  let calloutSlug: string;

  /**
   * Create a contact and log in as them. Groups are set with a separate
   * profile update so they are pushed to the newsletter provider.
   */
  async function createMember(groups?: string[]): Promise<TestMember> {
    const contact = await admin.contact.create({
      email: `nl-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      firstname: 'Newsletter',
      lastname: 'Tester',
      password: PASSWORD,
    });
    createdContactIds.push(contact.id);

    if (groups) {
      await admin.contact.update(contact.id, {
        profile: {
          newsletterStatus: NewsletterStatus.Subscribed,
          newsletterGroups: groups,
        },
      });
    }

    const client = new BeabeeClient({ host: api.host, path: api.path });
    await client.auth.login({ email: contact.email, password: PASSWORD });

    return { id: contact.id, client };
  }

  async function getProfile(contactId: string) {
    const contact = await admin.contact.get(contactId, [
      GetContactWith.Profile,
    ]);
    return contact.profile;
  }

  beforeAll(async () => {
    admin = new BeabeeClient({
      host: api.host,
      path: api.path,
      token: testUser.apiKey,
    });

    member = await createMember([KOMBUCHA.id, TEA.id]);
    unsubscribedMember = await createMember();

    const callout = await admin.callout.create(createTestCallout());
    calloutSlug = callout.slug;
  });

  afterAll(async () => {
    await admin.callout.delete(calloutSlug);
    for (const id of createdContactIds) {
      await admin.contact.delete(id);
    }
  });

  describe('get', () => {
    it('should list the groups a contact is subscribed to', async () => {
      const groups = await member.client.contact.newsletter.getGroups('me');

      expect(groups).toHaveLength(2);
      expect(groups).toEqual(expect.arrayContaining([KOMBUCHA, TEA]));
    });

    it('should return an empty list for a contact without groups', async () => {
      const groups =
        await unsubscribedMember.client.contact.newsletter.getGroups('me');

      expect(groups).toEqual([]);
    });

    it("should let admins read another contact's groups", async () => {
      const groups = await admin.contact.newsletter.getGroups(member.id);

      expect(groups).toHaveLength(2);
    });

    it("should not let members read another contact's groups", async () => {
      await expect(
        member.client.contact.newsletter.getGroups(unsubscribedMember.id)
      ).rejects.toMatchObject({ httpCode: 401 });
    });
  });

  describe('unsubscribe', () => {
    it("should not let members change another contact's groups", async () => {
      await expect(
        member.client.contact.newsletter.unsubscribe(
          unsubscribedMember.id,
          KOMBUCHA.id
        )
      ).rejects.toMatchObject({ httpCode: 401 });
    });

    it('should reject an unknown group without retrying', async () => {
      await expect(
        member.client.contact.newsletter.unsubscribe('me', 'not-a-group')
      ).rejects.toMatchObject({ httpCode: 400 });

      const groups = await member.client.contact.newsletter.getGroups('me');
      expect(groups).toHaveLength(2);
    });

    it('should fail rather than silently succeed for a contact without newsletter status', async () => {
      await expect(
        unsubscribedMember.client.contact.newsletter.unsubscribe(
          'me',
          KOMBUCHA.id
        )
      ).rejects.toMatchObject({ httpCode: 500 });
    });

    it('should remove only the given group', async () => {
      await member.client.contact.newsletter.unsubscribe('me', TEA.id);

      const groups = await member.client.contact.newsletter.getGroups('me');
      expect(groups).toEqual([KOMBUCHA]);

      const profile = await getProfile(member.id);
      expect(profile.newsletterGroups).toEqual([KOMBUCHA.id]);
      expect(profile.newsletterStatus).toBe(NewsletterStatus.Subscribed);
    });

    it('should leave the contact subscribed with no groups after the last one', async () => {
      await member.client.contact.newsletter.unsubscribe('me', KOMBUCHA.id);

      const groups = await member.client.contact.newsletter.getGroups('me');
      expect(groups).toEqual([]);

      const profile = await getProfile(member.id);
      expect(profile.newsletterGroups).toEqual([]);
      expect(profile.newsletterStatus).toBe(NewsletterStatus.Subscribed);
    });
  });

  describe('other contact updates', () => {
    let otherMember: TestMember;

    beforeAll(async () => {
      otherMember = await createMember([KOMBUCHA.id, TEA.id]);
    });

    it('should keep groups when a contact is updated without group changes', async () => {
      await admin.contact.update(otherMember.id, { firstname: 'Renamed' });

      const profile = await getProfile(otherMember.id);
      expect(profile.newsletterGroups.sort()).toEqual(
        [KOMBUCHA.id, TEA.id].sort()
      );
    });

    it('should replace groups when an admin sets them', async () => {
      await admin.contact.update(otherMember.id, {
        profile: { newsletterGroups: [KOMBUCHA.id] },
      });

      const profile = await getProfile(otherMember.id);
      expect(profile.newsletterGroups).toEqual([KOMBUCHA.id]);

      const groups = await admin.contact.newsletter.getGroups(otherMember.id);
      expect(groups).toEqual([KOMBUCHA]);
    });

    it('should add groups on callout opt-in without removing existing ones', async () => {
      await otherMember.client.callout.createResponse(calloutSlug, {
        answers: createTestCalloutResponseAnswers('slide1'),
        newsletter: { optIn: true, groups: [TEA.id] },
      });

      const profile = await getProfile(otherMember.id);
      expect(profile.newsletterGroups.sort()).toEqual(
        [KOMBUCHA.id, TEA.id].sort()
      );
      // A subscribed contact must not be sent back to pending
      expect(profile.newsletterStatus).toBe(NewsletterStatus.Subscribed);
    });

    it('should set pending status on callout opt-in for a contact without newsletter status', async () => {
      await unsubscribedMember.client.callout.createResponse(calloutSlug, {
        answers: createTestCalloutResponseAnswers('slide1'),
        newsletter: { optIn: true, groups: [TEA.id] },
      });

      const profile = await getProfile(unsubscribedMember.id);
      expect(profile.newsletterGroups).toEqual([TEA.id]);
      expect(profile.newsletterStatus).toBe(NewsletterStatus.Pending);
    });
  });
});
