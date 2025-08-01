import type {
  CreateCalloutData,
  CreateCalloutResponseData,
  GetCalloutData,
  GetCalloutDataWith,
  GetCalloutResponseData,
  GetCalloutResponseDataWith,
  GetCalloutResponseMapData,
  GetCalloutResponseWith,
  GetCalloutResponsesQuery,
  GetCalloutWith,
  GetCalloutsQuery,
  Paginated,
  Serial,
  UpdateCalloutData,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { BaseClient } from './base.client.js';
import { CalloutResponseClient } from './callout-response.client.js';
import { CalloutReviewerClient } from './callout-reviewer.client.js';
import { CalloutTagClient } from './callout-tag.client.js';

export class CalloutClient extends BaseClient {
  /** Client for managing callout responses */
  response: CalloutResponseClient;

  /** Client for managing callout tags */
  tag: CalloutTagClient;

  /** Client for managing callout reviewers */
  reviewer: CalloutReviewerClient;

  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/callout'),
    });
    this.response = new CalloutResponseClient(options);
    this.tag = new CalloutTagClient(options);
    this.reviewer = new CalloutReviewerClient(options);
  }

  static deserialize<With extends GetCalloutWith = void>(
    _callout: Serial<GetCalloutDataWith<With>>
  ): GetCalloutDataWith<With>;

  /**
   * Deserialize a callout
   * @param callout The callout to deserialize
   * @returns The deserialized callout
   */
  static deserialize(_callout: Serial<GetCalloutData>): GetCalloutData {
    const callout: GetCalloutData = {
      ..._callout,
      starts: CalloutClient.deserializeDate(_callout.starts),
      expires: CalloutClient.deserializeDate(_callout.expires),
    };

    return callout;
  }

  /**
   * Get a callout
   * @param slugOrId The slug or id of the callout to get
   * @param _with The relations to include
   * @returns The callout
   */
  async get<With extends GetCalloutWith = void>(
    slugOrId: string,
    _with?: readonly With[],
    variant?: string
  ) {
    const { data } = await this.fetch.get<Serial<GetCalloutDataWith<With>>>(
      `/${slugOrId}`,
      { with: _with, variant }
    );
    return CalloutClient.deserialize(data);
  }

  /**
   * List callouts
   * @param _with The relations to include
   * @returns A paginated list of callouts
   */
  async list<With extends GetCalloutWith = void>(
    query: GetCalloutsQuery = {},
    _with?: readonly With[]
  ): Promise<Paginated<GetCalloutDataWith<With>>> {
    const { data } = await this.fetch.get<
      Paginated<Serial<GetCalloutDataWith<With>>>
    >('/', { with: _with, ...query });
    const items = data.items.map((item) => CalloutClient.deserialize(item));
    const callouts: Paginated<GetCalloutDataWith<With>> = {
      ...data,
      items,
    };

    return callouts;
  }

  /**
   * Create a callout
   * @param newData The data to create the callout with
   * @returns The created callout
   */
  async create(newData: CreateCalloutData) {
    const { data } = await this.fetch.post<Serial<GetCalloutData>>(
      '/',
      newData
    );
    return data;
  }

  /**
   * Update a callout
   * @param slug The slug of the callout to update
   * @param updateData The data to update
   * @returns The updated callout
   */
  async update(slug: string, updateData: UpdateCalloutData) {
    const { data } = await this.fetch.patch<Serial<GetCalloutData>>(
      '/' + slug,
      updateData
    );
    return CalloutClient.deserialize(data);
  }

  /**
   * Delete a callout
   * @param slug The slug of the callout to delete
   */
  async delete(slug: string) {
    await this.fetch.delete('/' + slug);
  }

  /**
   * List responses for a callout
   * @param slug The slug of the callout
   * @param query Optional query parameters
   * @param _with Optional relations to include
   */
  async listResponses<With extends GetCalloutResponseWith | void = void>(
    slug: string,
    query?: GetCalloutResponsesQuery,
    _with?: readonly With[]
  ): Promise<Paginated<GetCalloutResponseDataWith<With>>> {
    const { data } = await this.fetch.get<
      Paginated<Serial<GetCalloutResponseDataWith<With>>>
    >(`/${slug}/responses`, { with: _with, ...query });
    return {
      ...data,
      items: data.items.map((item) => CalloutResponseClient.deserialize(item)),
    };
  }

  /**
   * Get responses for map visualization
   * @param slug The slug of the callout
   * @param query Optional query parameters
   */
  async listResponsesForMap(
    slug: string,
    query?: GetCalloutResponsesQuery
  ): Promise<Paginated<GetCalloutResponseMapData>> {
    const { data } = await this.fetch.get<
      Paginated<Serial<GetCalloutResponseMapData>>
    >(`/${slug}/responses/map`, query);
    return data;
  }

  /**
   * Create a callout response
   * @param slug The slug of the callout
   * @param newData The response data
   * @param captchaToken Optional captcha token
   */
  async createResponse(
    slug: string,
    newData: Pick<
      CreateCalloutResponseData,
      'answers' | 'guest' | 'newsletter'
    >,
    captchaToken?: string
  ): Promise<{ id: string } | GetCalloutResponseData> {
    const { data } = await this.fetch.post<
      { id: string } | Serial<GetCalloutResponseData>
    >(
      `/${slug}/responses`,
      {
        answers: newData.answers,
        guest: newData.guest,
        newsletter: newData.newsletter,
      },
      { params: { captchaToken } }
    );
    return 'number' in data ? CalloutResponseClient.deserialize(data) : data;
  }

  /**
   * Creates a new callout based on an existing one
   * @param fromId - ID of the callout to replicate from
   * @param updateData - Data to update in the new callout
   * @returns The created callout
   */
  async clone(
    fromId: string,
    updateData: UpdateCalloutData
  ): Promise<GetCalloutData> {
    const { data } = await this.fetch.post<Serial<GetCalloutData>>(
      '',
      updateData,
      {
        params: { fromId },
      }
    );
    return CalloutClient.deserialize(data);
  }
}
