import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import { ContactClient } from "./contact.client.js";
import { CalloutResponseCommentClient } from "./callout-response-comment.client.js";

import type { BaseClientOptions } from "../types/index.js";
import type {
  GetCalloutResponseData,
  GetCalloutResponseDataWith,
  GetCalloutResponsesQuery,
  GetCalloutResponseWith,
  Paginated,
  RuleGroup,
  Serial,
  UpdateCalloutResponseData
} from "@beabee/beabee-common";

/**
 * Client for managing callout responses
 * Handles submissions from users responding to callouts, including their answers and metadata
 * @extends BaseClient
 */
export class CalloutResponseClient extends BaseClient {
  /** Sub-client for managing comments on responses */
  comment: CalloutResponseCommentClient;

  /**
   * Creates a new callout response client
   * @param options - The client options including API path
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + "/callout-responses")
    });
    this.comment = new CalloutResponseCommentClient(options);
  }

  /**
   * Deserializes a response from the server data
   * Handles dates and nested objects like assignee, contact and latest comment
   * @param response - The serialized response data
   * @returns The deserialized response with proper date objects and nested entities
   */
  static deserialize<With extends GetCalloutResponseWith = void>(
    // TODO: how to make this type safe like Serial<GetCalloutResponseDataWith<With>>
    response: any
  ): GetCalloutResponseDataWith<With> {
    return {
      ...response,
      createdAt: CalloutResponseClient.deserializeDate(response.createdAt),
      updatedAt: CalloutResponseClient.deserializeDate(response.updatedAt),
      ...(response.assignee && {
        assignee: ContactClient.deserialize(response.assignee)
      }),
      ...(response.contact && {
        contact: ContactClient.deserialize(response.contact)
      }),
      ...(response.latestComment && {
        latestComment: CalloutResponseCommentClient.deserialize(
          response.latestComment
        )
      })
    };
  }

  /**
   * Lists responses to a callout with optional filtering and relations
   * Supports pagination and complex filtering rules
   * @param query - Query parameters for filtering responses
   * @param _with - Optional relations to include in the response
   * @returns A paginated list of responses
   */
  async list<With extends GetCalloutResponseWith = void>(
    query: GetCalloutResponsesQuery = {},
    _with?: readonly With[]
  ): Promise<Paginated<GetCalloutResponseDataWith<With>>> {
    const { data } = await this.fetch.get<
      Paginated<Serial<GetCalloutResponseDataWith<With>>>
    >("", { with: _with, ...query });

    return {
      ...data,
      items: data.items.map((item) => CalloutResponseClient.deserialize(item))
    };
  }

  /**
   * Bulk updates responses based on rules
   * Allows updating multiple responses that match certain criteria
   * @param rules - Rules to select which responses to update
   * @param updates - The update data to apply
   * @returns The number of affected responses
   */
  async updates(
    rules: RuleGroup,
    updates: UpdateCalloutResponseData
  ): Promise<{ affected: number }> {
    const { data } = await this.fetch.patch<Serial<{ affected: number }>>("", {
      rules,
      updates
    });
    return data;
  }

  /**
   * Gets a single response by ID
   * @param id - The ID of the response to retrieve
   * @param _with - Optional relations to include
   * @returns The response data with requested relations
   */
  async get<With extends GetCalloutResponseWith = void>(
    id: string,
    _with?: readonly With[]
  ): Promise<GetCalloutResponseDataWith<With>> {
    const { data } = await this.fetch.get<
      Serial<GetCalloutResponseDataWith<With>>
    >(`/${id}`, undefined, { params: { with: _with } });
    return CalloutResponseClient.deserialize<With>(data);
  }

  /**
   * Updates a single response
   * Can update status, assignee, and other metadata
   * @param id - The ID of the response to update
   * @param dataIn - The update data
   * @returns The updated response
   */
  async update(
    id: string,
    dataIn: UpdateCalloutResponseData
  ): Promise<GetCalloutResponseData> {
    const { data } = await this.fetch.patch<Serial<GetCalloutResponseData>>(
      `/${id}`,
      dataIn
    );
    return CalloutResponseClient.deserialize(data);
  }
}
