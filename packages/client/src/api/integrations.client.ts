import type {
  NewsletterDiffData,
  NewsletterIntegrationData,
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
  async getNewsletterStatus(): Promise<NewsletterIntegrationData> {
    const { data } =
      await this.fetch.get<NewsletterIntegrationData>('/newsletter');
    return data;
  }

  /**
   * Refreshes newsletter groups from the provider and returns the diff
   */
  async refreshNewsletterGroups(): Promise<NewsletterDiffData> {
    const { data } = await this.fetch.post<NewsletterDiffData>('/newsletter/refresh');
    return data;
  }
}
