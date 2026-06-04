import type { NewsletterIntegration } from '@beabee/beabee-common';

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
  async getNewsletter(): Promise<NewsletterIntegration> {
    const { data } = await this.fetch.get<NewsletterIntegration>('/newsletter');
    return data;
  }

  /**
   * Refreshes the newsletter integration for the given provider
   * TODO: confirm endpoint with backend — POST /newsletter/:provider/refresh
   */
  async refreshNewsletter(provider: string): Promise<NewsletterIntegration> {
    const { data } = await this.fetch.post<NewsletterIntegration>(
      `/newsletter/${provider}/refresh`
    );
    return data;
  }
}
