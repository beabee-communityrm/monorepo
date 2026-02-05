import type {
  GetContactData,
  GetContactsQuery,
  Paginated,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/** Segment-scoped contacts (e.g. list). Use segments.contact. */
export class SegmentContactClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/segments'),
    });
  }

  /**
   * List contacts in the segment (optionally with extra rule filter).
   *
   * @param segmentId Segment ID
   * @param query Optional pagination and rules (rules are ANDed with segment rules)
   */
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
