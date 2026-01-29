import type {
  GetContactData,
  GetContactsQuery,
  Paginated,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for segment-scoped contact operations (e.g. list contacts in segment).
 * Obtained via segments.contact.
 */
export class SegmentContactClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/segments'),
    });
  }

  async list(
    segmentId: string,
    query?: GetContactsQuery
  ): Promise<Paginated<GetContactData>> {
    const { data } = await this.fetch.get<Paginated<GetContactData>>(
      `/${segmentId}/contacts`,
      query || {}
    );
    return data;
  }
}
