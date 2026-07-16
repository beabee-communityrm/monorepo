import {
  ApiHealthStatus,
  TestNewsletterIntegrationData,
} from '@beabee/beabee-common';

import {
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact,
} from '#type/index';

export class TestProvider implements NewsletterProvider {
  static testGroups: { id: string; label: string }[] = [
    { id: 'b8e4acb751', label: 'Kombucha' },
    { id: 'c0b1a133d1', label: 'Tea' },
    { id: '7bd89a737b', label: 'Coffee' },
  ];

  async getContact(email: string): Promise<NewsletterContact | undefined> {
    return;
  }
  async upsertContact(
    contact: UpdateNewsletterContact,
    oldEmail?: string
  ): Promise<NewsletterContact> {
    return { ...contact, joined: new Date(), tags: [] };
  }
  async permanentlyDeleteContact(email: string): Promise<void> {}
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

  async getGroups(): Promise<{ id: string; label: string }[]> {
    return TestProvider.testGroups;
  }
}

/** @deprecated Use named import TestProvider instead */
export default TestProvider;
