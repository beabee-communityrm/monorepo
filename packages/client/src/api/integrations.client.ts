import type {
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
