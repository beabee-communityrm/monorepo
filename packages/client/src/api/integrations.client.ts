import type {
  GetNewsletterIntegrationData,
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
   * Fetches all integrations for the newsletter category
   */
  async listNewsletter(): Promise<GetNewsletterIntegrationData[]> {
    const { data } = await this.fetch.get<GetNewsletterIntegrationData[]>(
      '/newsletter'
    );
    return data;
  }

  /**
   * Refreshes a specific newsletter integration
   * TODO: confirm endpoint with backend — either POST /newsletter/:provider/refresh
   * or re-GET /newsletter/:provider depending on backend implementation
   */
  async refreshNewsletter(provider: string): Promise<GetNewsletterIntegrationData> {
    const { data } = await this.fetch.post<GetNewsletterIntegrationData>(
      `/newsletter/${provider}/refresh`
    );
    return data;
  }
}
