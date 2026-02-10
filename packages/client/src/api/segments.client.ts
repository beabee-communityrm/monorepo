import type {
  CreateSegmentData,
  GetSegmentDataWith,
  GetSegmentWith,
  GetSegmentsQuery,
  Serial,
  UpdateSegmentData,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';
import { SegmentContactClient } from './segment-contact.client.js';
import { SegmentEmailClient } from './segment-email.client.js';

/** Contact segments (saved filter rule groups). */
export class SegmentsClient extends BaseClient {
  readonly contact: SegmentContactClient;
  readonly email: SegmentEmailClient;

  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/segments'),
    });
    this.contact = new SegmentContactClient(options);
    this.email = new SegmentEmailClient(options);
  }

  /**
   * Retrieves a list of all segments
   * @param query - Optional query parameters to filter segments
   * @param _with - Optional related data to include with each segment
   * @returns Array of segments matching the query
   */
  async list<With extends GetSegmentWith = void>(
    query: GetSegmentsQuery = {},
    _with?: readonly With[]
  ): Promise<GetSegmentDataWith<With>[]> {
    const { data } = await this.fetch.get<Serial<GetSegmentDataWith<With>>[]>(
      '',
      { with: _with, ...query }
    );
    // TODO: needs Serial type guard
    return data as GetSegmentDataWith<With>[];
  }

  /**
   * Retrieves a single segment by ID
   * @param id - The segment ID
   * @param _with - Optional related data to include with the segment
   * @returns The requested segment
   */
  async get<With extends GetSegmentWith = void>(
    id: string,
    _with?: readonly With[]
  ): Promise<GetSegmentDataWith<With>> {
    const { data } = await this.fetch.get<Serial<GetSegmentDataWith<With>>>(
      `/${id}`,
      { with: _with }
    );
    // TODO: needs Serial type guard
    return data as GetSegmentDataWith<With>;
  }

  /**
   * Creates a new segment
   * @param input - The segment data including name and rule group
   * @returns The created segment with contact count
   *
   * @example
   * ```typescript
   * await segments.create({
   *   name: "Active Users",
   *   ruleGroup: {
   *     type: "group",
   *     rules: [
   *       // Define filter rules here
   *     ]
   *   }
   * });
   * ```
   */
  async create(
    input: CreateSegmentData
  ): Promise<GetSegmentDataWith<'itemCount'>> {
    const { data } = await this.fetch.post<
      Serial<GetSegmentDataWith<'itemCount'>>
    >('', {
      name: input.name,
      order: input.order,
      ruleGroup: input.ruleGroup,
      description: '', // TODO: deprecated from API
    });
    return data;
  }

  /**
   * Updates an existing segment
   * @param id - The segment ID to update
   * @param input - The updated segment data
   * @returns The updated segment with contact count
   *
   * @example
   * ```typescript
   * await segments.update("segment-id", {
   *   name: "Updated Segment Name",
   *   ruleGroup: {
   *     // Updated filter rules
   *   }
   * });
   * ```
   */
  async update(
    id: string,
    input: UpdateSegmentData
  ): Promise<GetSegmentDataWith<'itemCount'>> {
    const { data } = await this.fetch.patch<
      Serial<GetSegmentDataWith<'itemCount'>>
    >(`/${id}`, {
      name: input.name,
      order: input.order,
      ruleGroup: input.ruleGroup,
    });
    return data;
  }

  /**
   * Deletes a segment
   * @param id - The segment ID to delete
   */
  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }
}
