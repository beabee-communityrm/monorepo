import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import { ContactClient } from "./contact.client.js";

import type { BaseClientOptions } from "../types/index.js";
import type {
  CreateCalloutResponseCommentData,
  GetCalloutResponseCommentData,
  GetCalloutResponseCommentsQuery,
  Paginated,
  Serial,
  UpdateCalloutResponseCommentData,
} from "../deps.js";

/**
 * Client for managing comments on callout responses
 * Allows reviewers and admins to add comments to responses for internal discussion
 * @extends BaseClient
 */
export class CalloutResponseCommentClient extends BaseClient {
  /**
   * Creates a new callout response comment client
   * @param options - The client options including API path
   */
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/callout-response-comments");
    super(options);
  }

  /**
   * Deserializes a comment from the server response
   * Handles date fields and nested contact data
   * @param comment - The serialized comment data
   * @returns The deserialized comment with proper date objects
   */
  static deserialize(
    comment: Serial<GetCalloutResponseCommentData>,
  ): GetCalloutResponseCommentData {
    return {
      ...comment,
      createdAt: CalloutResponseCommentClient.deserializeDate(
        comment.createdAt,
      ),
      updatedAt: CalloutResponseCommentClient.deserializeDate(
        comment.updatedAt,
      ),
      contact: ContactClient.deserialize(comment.contact),
    };
  }

  /**
   * Lists all comments for a callout response
   * Supports pagination and filtering
   * @param query - Query parameters for filtering comments
   * @returns A paginated list of comments
   */
  async list(
    query: GetCalloutResponseCommentsQuery,
  ): Promise<Paginated<GetCalloutResponseCommentData>> {
    const { data } = await this.fetch.get<
      Paginated<Serial<GetCalloutResponseCommentData>>
    >("", { params: query });

    return {
      ...data,
      items: data.items.map((item) =>
        CalloutResponseCommentClient.deserialize(item)
      ),
    };
  }

  /**
   * Creates a new comment on a callout response
   * @param newData - The comment data to create
   * @returns The created comment
   */
  async create(
    newData: CreateCalloutResponseCommentData,
  ): Promise<GetCalloutResponseCommentData> {
    const { data } = await this.fetch.post<
      Serial<GetCalloutResponseCommentData>
    >(
      "",
      newData,
    );
    return CalloutResponseCommentClient.deserialize(data);
  }

  /**
   * Deletes a comment from a callout response
   * Only the comment author or admins can delete comments
   * @param id - The ID of the comment to delete
   */
  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }

  /**
   * Updates an existing comment
   * Only the comment author can update their comments
   * @param id - The ID of the comment to update
   * @param updateData - The new comment data
   * @returns The updated comment
   */
  async update(
    id: string,
    updateData: UpdateCalloutResponseCommentData,
  ): Promise<GetCalloutResponseCommentData> {
    const { data } = await this.fetch.patch<
      Serial<GetCalloutResponseCommentData>
    >(
      `/${id}`,
      updateData,
    );
    return CalloutResponseCommentClient.deserialize(data);
  }
}
