import type {
  GetStatsData,
  GetStatsQuery,
  Serial,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for fetching statistics
 */
export class StatsClient extends BaseClient {
  /**
   * Creates a new stats client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/stats'),
    });
  }

  /**
   * Fetches statistics based on query parameters
   * @param query - The query parameters for filtering stats
   * @returns The statistics data
   */
  async list(query: GetStatsQuery): Promise<GetStatsData> {
    const { data } = await this.fetch.get<Serial<GetStatsData>>('', query);
    return data;
  }
}
