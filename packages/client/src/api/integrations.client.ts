import type {
  ContactSyncIntegrationDataWith,
  GetContactSyncWith,
  GetNewsletterWith,
  NewsletterDiffData,
  NewsletterGroupData,
  NewsletterIntegrationData,
  NewsletterIntegrationDataWith,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

export class IntegrationsClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/integrations'),
    });
  }

  /**
   * Fetches the newsletter integration for this instance
   */
  async getNewsletter<With extends GetNewsletterWith = void>(
    _with?: readonly With[]
  ): Promise<NewsletterIntegrationDataWith<With>> {
    const { data } = await this.fetch.get<NewsletterIntegrationDataWith<With>>(
      '/newsletter',
      { with: _with }
    );
    return data;
  }

  /**
   * Fetches the contact sync integration for this instance
   */
  async getContactSync<With extends GetContactSyncWith = void>(
    _with?: readonly With[]
  ): Promise<ContactSyncIntegrationDataWith<With>> {
    const { data } = await this.fetch.get<ContactSyncIntegrationDataWith<With>>(
      '/contact-sync',
      { with: _with }
    );
    return data;
  }

  /**
   * Refreshes newsletter groups from the provider and returns the diff
   */
  async refreshNewsletterGroups(): Promise<NewsletterDiffData> {
    const { data } = await this.fetch.post<NewsletterDiffData>(
      '/newsletter/refresh'
    );
    return data;
  }

  /**
   * Get newsletter group cache
   */
  async getNewsletterGroups(): Promise<NewsletterGroupData[]> {
    const { data } =
      await this.fetch.get<NewsletterIntegrationData>('/newsletter');
    return data.provider !== 'none' ? data.groups : [];
  }
}
