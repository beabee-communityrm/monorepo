import type {
  ActivityEventType,
  GetActivityEventDataWith,
  GetActivityEventWith,
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
   * Deserializes an activity event from the server data
   * @param event - The serialized event data
   * @returns The deserialized event with proper date objects
   */
  static deserialize<
    T extends ActivityEventType = ActivityEventType,
    With extends GetActivityEventWith | void = void,
  >(
    event: Omit<GetActivityEventDataWith<With, T>, 'createdAt'> & {
      createdAt: string;
    }
  ): GetActivityEventDataWith<With, T> {
    // The fields added by With can't be resolved while it is generic
    return {
      ...event,
      createdAt: ActivityClient.deserializeDate(event.createdAt),
    } as GetActivityEventDataWith<With, T>;
  }

  /**
   * Lists all activity feed events
   * @param query - Pagination and sorting parameters
   * @param _with - Optional related data to include with each event
   * @returns Paginated list of activity events
   */
  async list<
    T extends ActivityEventType = ActivityEventType,
    With extends GetActivityEventWith | void = void,
  >(
    query: GetActivityEventsQuery = {},
    _with?: readonly With[]
  ): Promise<Paginated<GetActivityEventDataWith<With, T>>> {
    const { data } = await this.fetch.get<
      Paginated<
        Omit<GetActivityEventDataWith<With, T>, 'createdAt'> & {
          createdAt: string;
        }
      >
    >('/', { with: _with, ...query });
    return {
      ...data,
      items: data.items.map((item) =>
        ActivityClient.deserialize<T, With>(item)
      ),
    };
  }
}
