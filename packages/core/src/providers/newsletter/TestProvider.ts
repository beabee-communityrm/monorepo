import {
  ApiHealthStatus,
  BaseNewsletterGroupData,
  TestNewsletterIntegrationData,
} from '@beabee/beabee-common';

import { CantUpdateNewsletterGroupsError } from '#errors/index';
import OptionsService from '#services/OptionsService';
import {
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact,
} from '#type/index';

/**
 * In-memory stand-in for Mailchimp. Contacts are kept per process so that
 * group changes behave like they do on Mailchimp's side: partial updates only
 * touch the listed groups, a full update declares every cached group, and an
 * unknown group ID is rejected.
 */
export class TestProvider implements NewsletterProvider {
  static testGroups: BaseNewsletterGroupData[] = [
    { id: 'b8e4acb751', label: 'Kombucha' },
    { id: 'c0b1a133d1', label: 'Tea' },
    { id: '7bd89a737b', label: 'Coffee' },
  ];

  private readonly contacts = new Map<string, NewsletterContact>();

  async getContact(email: string): Promise<NewsletterContact | undefined> {
    return this.contacts.get(email);
  }

  async upsertContact(
    contact: UpdateNewsletterContact,
    oldEmail = contact.email
  ): Promise<NewsletterContact> {
    const existing = this.contacts.get(oldEmail);

    const updated: NewsletterContact = {
      ...contact,
      groups: this.applyGroupChange(existing?.groups ?? [], contact),
      joined: existing?.joined ?? new Date(),
      tags: existing?.tags ?? [],
    };

    this.contacts.delete(oldEmail);
    this.contacts.set(contact.email, updated);
    return updated;
  }

  /**
   * Mirror what `nlContactToMCMember` sends to Mailchimp and how Mailchimp
   * applies it. `add`/`remove` send only the listed IDs, `replace` sends every
   * cached group ID. Any sent ID the provider doesn't know is rejected.
   */
  private applyGroupChange(
    current: string[],
    contact: UpdateNewsletterContact
  ): string[] {
    if (!contact.groups) {
      return current;
    }

    const isPartial =
      contact.newsletterGroupChange === 'add' ||
      contact.newsletterGroupChange === 'remove';

    const sentIds: string[] = isPartial
      ? contact.groups
      : OptionsService.getJSON('newsletter-groups').map(
          (group: BaseNewsletterGroupData) => group.id
        );

    const knownIds = new Set(TestProvider.testGroups.map((g) => g.id));
    const invalidId = sentIds.find((id) => !knownIds.has(id));
    if (invalidId) {
      throw new CantUpdateNewsletterGroupsError(
        `Invalid Interest ID: ${invalidId}`
      );
    }

    switch (contact.newsletterGroupChange) {
      case 'add':
        return [...new Set([...current, ...contact.groups])];
      case 'remove':
        return current.filter((id) => !contact.groups?.includes(id));
      default:
        return sentIds.filter((id) => contact.groups?.includes(id));
    }
  }

  async permanentlyDeleteContact(email: string): Promise<void> {
    this.contacts.delete(email);
  }
  async updateContactFields(
    email: string,
    fields: Record<string, string>
  ): Promise<void> {}
  async updateContactTags(
    email: string,
    tags: Record<string, boolean>
  ): Promise<void> {}

  async getProviderInfo(
    withHealth = false
  ): Promise<TestNewsletterIntegrationData> {
    const resp: TestNewsletterIntegrationData = {
      provider: 'test',
      audienceId: 'testing-only',
      groups: TestProvider.testGroups.map((group) => ({
        ...group,
        checked: false,
      })),
    };

    if (withHealth) {
      resp.status = ApiHealthStatus.HEALTHY;
    }
    return resp;
  }

  async getGroups(): Promise<BaseNewsletterGroupData[]> {
    return TestProvider.testGroups;
  }
}

/** @deprecated Use named import TestProvider instead */
export default TestProvider;
