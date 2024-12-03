import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import type { BaseClientOptions } from "../types/index.js";
import type { GetCalloutReviewerData, Serial } from "../deps.js";

/**
 * Client for managing callout reviewer operations
 */
export class CalloutReviewerClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/callout");
    super(options);
  }

  /**
   * Deserialize a reviewer
   */
  protected deserialize(
    data: Serial<GetCalloutReviewerData>,
  ): GetCalloutReviewerData {
    return {
      ...data,
      contact: {
        ...data.contact,
        joined: CalloutReviewerClient.deserializeDate(data.contact.joined),
        lastSeen: CalloutReviewerClient.deserializeDate(data.contact.lastSeen),
      },
    };
  }

  /**
   * Get all reviewers for a callout
   * @param calloutId The ID or slug of the callout
   * @returns List of reviewers
   */
  async list(calloutId: string): Promise<GetCalloutReviewerData[]> {
    const { data } = await this.fetch.get<Serial<GetCalloutReviewerData[]>>(
      `/${calloutId}/reviewers`,
    );
    return data.map((reviewer) => this.deserialize(reviewer));
  }

  /**
   * Add a reviewer to a callout
   * @param calloutId The ID or slug of the callout
   * @param contactId The ID of the contact to add as reviewer
   */
  async add(calloutId: string, contactId: string): Promise<void> {
    await this.fetch.post(
      `/${calloutId}/reviewers`,
      { contactId },
    );
  }

  /**
   * Remove a reviewer from a callout
   * @param calloutId The ID or slug of the callout
   * @param reviewerId The ID of the reviewer to remove
   */
  async remove(calloutId: string, reviewerId: string): Promise<void> {
    await this.fetch.delete(`/${calloutId}/reviewers/${reviewerId}`);
  }
}
