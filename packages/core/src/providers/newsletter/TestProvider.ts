import {
  ApiHealthStatus,
  TestNewsletterIntegrationData,
} from '@beabee/beabee-common';

import OptionsService from '#services/OptionsService';
import {
  NewsletterContact,
  NewsletterProvider,
  UpdateNewsletterContact,
} from '#type/index';

export class TestProvider implements NewsletterProvider {
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
      groups: OptionsService.getJSON('newsletter-groups'),
    };

    if (withHealth) {
      resp.status = ApiHealthStatus.HEALTHY;
    }
    return resp;
  }

  async getGroups(): Promise<{ id: string; label: string }[]> {
    // remove group 'coffee'
    const testGroups = [
      { id: 'b8e4acb751', label: 'Kombucha' },
      { id: 'c0b1a133d1', label: 'Tea' },
      { id: 'd0g6ced973', label: 'Apfelschorle' },
    ];
    return testGroups;
  }
}

/** @deprecated Use named import TestProvider instead */
export default TestProvider;
