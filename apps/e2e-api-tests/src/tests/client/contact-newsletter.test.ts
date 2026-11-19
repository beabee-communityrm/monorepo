import {
  GetContactWith,
  NewsletterStatus,
  type Rule,
} from '@beabee/beabee-common';
import { BeabeeClient } from '@beabee/client';
import { api, newsletterGroups, testUser } from '@beabee/test-utils/test-data';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  createTestCallout,
  createTestCalloutResponseAnswers,
} from '../../fixtures/callouts.js';

// Groups this file configures on the test newsletter provider. Coffee is only
// there to keep the seeded data intact, as a refresh strips unknown groups
// from every profile.
const { kombucha: KOMBUCHA, tea: TEA, coffee: COFFEE } = newsletterGroups;

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
   * Create a contact and a client acting as them. The client uses the admin
   * API key with the `x-contact-id` header rather than a cookie login, as the
   * client's cookie store is shared between all instances in a process.
   * Groups are set with a separate profile update so they are pushed to the
   * newsletter provider.
   */
  async function createMember(groups?: string[]): Promise<TestMember> {
    const contact = await admin.contact.create({
      email: `nl-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      firstname: 'Newsletter',
      lastname: 'Tester',
    });
    createdContactIds.push(contact.id);

    if (groups) {
      await admin.contact.update(contact.id, {
        newsletter: {
          status: NewsletterStatus.Subscribed,
          groups: groups,
        },
      });
    }

    const client = new BeabeeClient({
      host: api.host,
      path: api.path,
      token: testUser.apiKey,
      headers: { 'x-contact-id': contact.id },
    });

    return { id: contact.id, client };
  }

  async function getNewsletter(contactId: string) {
    const contact = await admin.contact.get(contactId, [
      GetContactWith.Newsletter,
    ]);
    return contact.newsletter;
  }

  beforeAll(async () => {
    admin = new BeabeeClient({
      host: api.host,
      path: api.path,
      token: testUser.apiKey,
    });

    await admin.fetch.post('/dev/newsletter-groups', [KOMBUCHA, TEA, COFFEE]);
    await admin.integrations.refreshNewsletterGroups();

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

      const newsletter = await getNewsletter(member.id);
      expect(newsletter.groups).toEqual([KOMBUCHA.id]);
      expect(newsletter.status).toBe(NewsletterStatus.Subscribed);
    });

    it('should leave the contact subscribed with no groups after the last one', async () => {
      await member.client.contact.newsletter.unsubscribe('me', KOMBUCHA.id);

      const groups = await member.client.contact.newsletter.getGroups('me');
      expect(groups).toEqual([]);

      const newsletter = await getNewsletter(member.id);
      expect(newsletter.groups).toEqual([]);
      expect(newsletter.status).toBe(NewsletterStatus.Subscribed);
    });
  });

  describe('other contact updates', () => {
    let otherMember: TestMember;

    beforeAll(async () => {
      otherMember = await createMember([KOMBUCHA.id, TEA.id]);
    });

    it('should keep groups when a contact is updated without group changes', async () => {
      await admin.contact.update(otherMember.id, { firstname: 'Renamed' });

      const newsletter = await getNewsletter(otherMember.id);
      expect(newsletter.groups.sort()).toEqual([KOMBUCHA.id, TEA.id].sort());
    });

    it('should replace groups when an admin sets them', async () => {
      await admin.contact.update(otherMember.id, {
        newsletter: { groups: [KOMBUCHA.id] },
      });

      const newsletter = await getNewsletter(otherMember.id);
      expect(newsletter.groups).toEqual([KOMBUCHA.id]);

      const groups = await admin.contact.newsletter.getGroups(otherMember.id);
      expect(groups).toEqual([KOMBUCHA]);
    });

    it('should add groups on callout opt-in without removing existing ones', async () => {
      await otherMember.client.callout.createResponse(calloutSlug, {
        answers: createTestCalloutResponseAnswers('slide1'),
        newsletter: { optIn: true, groups: [TEA.id] },
      });

      const newsletter = await getNewsletter(otherMember.id);
      expect(newsletter.groups.sort()).toEqual([KOMBUCHA.id, TEA.id].sort());
      // A subscribed contact must not be sent back to pending
      expect(newsletter.status).toBe(NewsletterStatus.Subscribed);
    });

    it('should set pending status on callout opt-in for a contact without newsletter status', async () => {
      await unsubscribedMember.client.callout.createResponse(calloutSlug, {
        answers: createTestCalloutResponseAnswers('slide1'),
        newsletter: { optIn: true, groups: [TEA.id] },
      });

      const newsletter = await getNewsletter(unsubscribedMember.id);
      expect(newsletter.groups).toEqual([TEA.id]);
      expect(newsletter.status).toBe(NewsletterStatus.Pending);
    });
  });

  describe('segment filters', () => {
    let subscribedMember: TestMember;
    let noStatusMember: TestMember;

    beforeAll(async () => {
      subscribedMember = await createMember([TEA.id]);
      noStatusMember = await createMember();
    });

    async function matches(contactId: string, rule: Rule): Promise<boolean> {
      const result = await admin.contact.list({
        rules: {
          condition: 'AND',
          rules: [{ field: 'id', operator: 'equal', value: [contactId] }, rule],
        },
      });
      return result.total === 1;
    }

    it('should filter by newsletter status', async () => {
      const rule: Rule = {
        field: 'newsletterStatus',
        operator: 'equal',
        value: [NewsletterStatus.Subscribed],
      };
      expect(await matches(subscribedMember.id, rule)).toBe(true);
      expect(await matches(noStatusMember.id, rule)).toBe(false);
    });

    it('should filter by newsletter group', async () => {
      const rule: Rule = {
        field: 'newsletterGroups',
        operator: 'contains',
        value: [TEA.id],
      };
      expect(await matches(subscribedMember.id, rule)).toBe(true);
      expect(await matches(noStatusMember.id, rule)).toBe(false);
    });
  });

  describe('signup', () => {
    async function signUp(
      email: string,
      newsletter?: {
        newsletterStatus: NewsletterStatus;
        newsletterGroups: string[];
      }
    ): Promise<string> {
      await admin.signup.start({ email, ...newsletter });
      const { data: signupFlow } = await admin.fetch.get<{ id: string }>(
        `/dev/signup-flow/${email}`
      );
      await admin.signup.confirmEmail(signupFlow.id);

      const { items } = await admin.contact.list({
        rules: {
          condition: 'AND',
          rules: [{ field: 'email', operator: 'equal', value: [email] }],
        },
      });
      expect(items).toHaveLength(1);
      return items[0].id;
    }

    function uniqueEmail(): string {
      return `nl-signup-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
    }

    // Starting and confirming a signup are both rate limited per user
    beforeEach(async () => {
      await admin.fetch.post('/dev/clear-rate-limiter-cache');
    });

    afterAll(async () => {
      await admin.fetch.post('/dev/clear-rate-limiter-cache');
    });

    it('should apply the default status to a new contact', async () => {
      const contactId = await signUp(uniqueEmail());
      createdContactIds.push(contactId);

      const newsletter = await getNewsletter(contactId);
      expect(newsletter.status).toBe(NewsletterStatus.None);
      expect(newsletter.groups).toEqual([]);
    });

    it('should apply the chosen status and groups to a new contact', async () => {
      const contactId = await signUp(uniqueEmail(), {
        newsletterStatus: NewsletterStatus.Subscribed,
        newsletterGroups: [TEA.id],
      });
      createdContactIds.push(contactId);

      const newsletter = await getNewsletter(contactId);
      expect(newsletter.status).toBe(NewsletterStatus.Subscribed);
      expect(newsletter.groups).toEqual([TEA.id]);
    });

    it('should subscribe an existing contact that opts in', async () => {
      const existing = await createMember();
      const contact = await admin.contact.get(existing.id);
      const contactId = await signUp(contact.email, {
        newsletterStatus: NewsletterStatus.Subscribed,
        newsletterGroups: [KOMBUCHA.id],
      });
      expect(contactId).toBe(existing.id);

      const newsletter = await getNewsletter(existing.id);
      expect(newsletter.status).toBe(NewsletterStatus.Subscribed);
      expect(newsletter.groups).toEqual([KOMBUCHA.id]);
    });

    it('should leave an existing contact alone without an opt-in', async () => {
      const existing = await createMember([KOMBUCHA.id]);
      const contact = await admin.contact.get(existing.id);
      await signUp(contact.email);

      const newsletter = await getNewsletter(existing.id);
      expect(newsletter.status).toBe(NewsletterStatus.Subscribed);
      expect(newsletter.groups).toEqual([KOMBUCHA.id]);
    });
  });
});
