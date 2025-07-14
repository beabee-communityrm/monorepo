import type {
  CreateCalloutReviewerData,
  GetCalloutReviewerData,
  PaginatedQuery,
  Serial,
  UpdateCalloutReviewerData,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';
import { ContactClient } from './contact.client.js';

/**
 * Client for managing callout reviewer operations
 */
export class CalloutReviewerClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/callout'),
    });
  }

  /**
   * Deserialize a reviewer
   */
  protected deserialize(
    data: Serial<GetCalloutReviewerData>
  ): GetCalloutReviewerData {
    return {
      ...data,
      contact: ContactClient.deserialize(data.contact),
    };
  }

  /**
   * Get all reviewers for a callout
   * @param calloutId The ID or slug of the callout
   * @returns List of reviewers
   */
  async list(
    calloutId: string,
    query?: PaginatedQuery
  ): Promise<GetCalloutReviewerData[]> {
    const { data } = await this.fetch.get<Serial<GetCalloutReviewerData[]>>(
      `/${calloutId}/reviewers`,
      query
    );
    return data.map((reviewer) => this.deserialize(reviewer));
  }

  /**
   * Add a reviewer to a callout
   * @param calloutId The ID or slug of the callout
   * @param contactId The ID of the contact to add as reviewer
   */
  async add(
    calloutId: string,
    newData: CreateCalloutReviewerData
  ): Promise<void> {
    await this.fetch.post(`/${calloutId}/reviewers`, newData);
  }

  /**
   * Update a reviewer's details
   * @param calloutId The ID or slug of the callout
   * @param reviewerId The ID of the reviewer to update
   * @param data The updated reviewer data
   */
  async update(
    calloutId: string,
    reviewerId: string,
    data: UpdateCalloutReviewerData
  ): Promise<void> {
    await this.fetch.patch(`/${calloutId}/reviewers/${reviewerId}`, data);
  }

  /**
   * Remove a reviewer from a callout
   * @param calloutId The ID or slug of the callout
   * @param reviewerId The ID of the reviewer to remove
   */
  async delete(calloutId: string, reviewerId: string): Promise<void> {
    await this.fetch.delete(`/${calloutId}/reviewers/${reviewerId}`);
  }
}
