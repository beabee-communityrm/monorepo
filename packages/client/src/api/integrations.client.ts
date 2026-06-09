import type {
  GetNewsletterWith,
  NewsletterDiffData,
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
    const { data } = await this.fetch.get<{
      info: NewsletterIntegrationDataWith<With>;
    }>('/newsletter', { with: _with });
    return data.info;
  }

  /**
   * Refreshes newsletter groups from the provider and returns the diff
   */
  async refreshNewsletterGroups(): Promise<NewsletterDiffData> {
    const { data } = await this.fetch.post<NewsletterDiffData>(
      '/newsletter/refresh'
    );
    console.log(data);
    return data;
  }
}
