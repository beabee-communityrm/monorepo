import type {
  ActivityEventType,
  GetActivityEventData,
  GetActivityEventsQuery,
  Paginated,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing activity feed
 * Handles retrieval and listing of activity feed records
 * @extends BaseClient
 */
export class ActivityClient extends BaseClient {
  /**
   * Creates a new activity client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/activity'),
    });
  }

  /**
   * Lists all activity feed events
   * @param query - Pagination and sorting parameters
   * @returns Paginated list of activity events
   */
  async list<T extends ActivityEventType = ActivityEventType>(
    query: GetActivityEventsQuery = {}
  ): Promise<Paginated<GetActivityEventData<T>>> {
    const { data } = await this.fetch.get<
      Paginated<
        Omit<GetActivityEventData<T>, 'createdAt'> & { createdAt: string }
      >
    >('/', query);
    return {
      ...data,
      items: data.items.map((item) => ({
        ...item,
        createdAt: ActivityClient.deserializeDate(item.createdAt),
      })),
    };
  }
}
