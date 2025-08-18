import type {
  CreateCalloutResponseSegmentData,
  GetCalloutResponseSegmentDataWith,
  GetCalloutResponseSegmentWith,
  PaginatedQuery,
  Serial,
  UpdateCalloutResponseSegmentData,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing callout response segment operations
 */
export class CalloutResponseSegmentClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + ''),
    });
  }

  /**
   * Get the base API path for callout segment operations
   * @param calloutId - The slug of the callout
   * @returns Base path for callout segments
   */
  protected getBasePath(calloutId: string | undefined): string {
    return `/callout/${calloutId}/segments`;
  }

  /**
   * Deserialize a segment response
   */
  protected deserialize<
    With extends GetCalloutResponseSegmentWith | void = void,
  >(data: any): GetCalloutResponseSegmentDataWith<With> {
    return {
      ...data,
    };
  }

  /**
   * Get all segments for a callout
   * @param calloutId The slug of the callout
   * @returns List of segments
   */
  async list<With extends GetCalloutResponseSegmentWith = void>(
    calloutId: string,
    query?: PaginatedQuery,
    _with?: readonly With[]
  ): Promise<GetCalloutResponseSegmentDataWith<With>[]> {
    const { data } = await this.fetch.get<
      Serial<GetCalloutResponseSegmentDataWith<With>>[]
    >(this.getBasePath(calloutId), { with: _with, ...query });
    return data.map((segment) => this.deserialize(segment));
  }

  /**
   * Create a new callout response segment
   * @param calloutId - The slug of the callout
   * @param input - The segment data
   * @returns The created segment with contact count
   */
  async create(
    calloutId: string,
    input: CreateCalloutResponseSegmentData
  ): Promise<GetCalloutResponseSegmentDataWith<'calloutResponseCount'>> {
    const { data } = await this.fetch.post<
      Serial<GetCalloutResponseSegmentDataWith<'calloutResponseCount'>>
    >(this.getBasePath(calloutId), {
      name: input.name,
      order: input.order,
      ruleGroup: input.ruleGroup,
    });
    return data;
  }

  /**
   * Updates an existing segment
   * @param calloutId - The slug of the callout
   * @param segmentId - The ID of the segment to update
   * @param input - The updated segment data
   * @returns The updated segment with contact count
   *
   * @example
   * ```typescript
   * await callout.segments.update("callout-id", "segment-id", {
   *   name: "Updated Segment Name",
   *   ruleGroup: {
   *     // Updated filter rules
   *   }
   * });
   * ```
   */
  async update(
    calloutId: string,
    segmentId: string,
    input: UpdateCalloutResponseSegmentData
  ): Promise<GetCalloutResponseSegmentDataWith<'calloutResponseCount'>> {
    const { data } = await this.fetch.patch<
      Serial<GetCalloutResponseSegmentDataWith<'calloutResponseCount'>>
    >(this.getBasePath(calloutId) + `/${segmentId}`, {
      name: input.name,
      ruleGroup: input.ruleGroup,
    });
    return data;
  }

  /**
   * Deletes a segment
   * @param calloutId - The slug of the callout
   * @param segmentId - The segment ID to delete
   */
  async delete(calloutId: string, segmentId: string): Promise<void> {
    await this.fetch.delete(this.getBasePath(calloutId) + `/${segmentId}`);
  }
}
