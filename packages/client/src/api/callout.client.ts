import { BaseClient } from "./base.client.ts";
import { cleanUrl } from "../utils/index.ts";
import { CalloutResponseClient } from "./callout-response.client.ts";
import { CalloutTagClient } from "./callout-tag.client.ts";
import type { BaseClientOptions } from "../types/index.ts";
import type {
  CreateCalloutData,
  CreateCalloutResponseData,
  GetCalloutData,
  GetCalloutDataWith,
  GetCalloutResponseDataWith,
  GetCalloutResponseMapData,
  GetCalloutResponsesQuery,
  GetCalloutResponseWith,
  GetCalloutsQuery,
  GetCalloutWith,
  Paginated,
  Serial,
  UpdateCalloutData,
} from "../deps.ts";

export class CalloutClient extends BaseClient {
  /** Client for managing callout responses */
  response: CalloutResponseClient;

  /** Client for managing callout tags */
  tag: CalloutTagClient;

  constructor(protected override readonly options: BaseClientOptions) {
    // e.g. `/api/1.0/callout`
    options.path = cleanUrl(options.path + "/callout");
    super(options);
    this.response = new CalloutResponseClient(options);
    this.tag = new CalloutTagClient(options);
  }

  static deserialize<With extends GetCalloutWith = void>(
    _callout: Serial<GetCalloutDataWith<With>>,
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
  ) {
    const { data } = await this.fetch.get<Serial<GetCalloutDataWith<With>>>(
      `/${slugOrId}`,
      { with: _with },
    );
    return CalloutClient.deserialize(data);
  }

  /**
   * List callouts
   * @param _with The relations to include
   * @returns A paginated list of callouts
   */
  async list<With extends GetCalloutWith = void>(
    query?: GetCalloutsQuery,
    _with?: readonly With[],
  ): Promise<Paginated<GetCalloutDataWith<With>>> {
    const { data } = await this.fetch.get<
      Paginated<Serial<GetCalloutDataWith<With>>>
    >(
      "/",
      { with: _with, ...query },
    );
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
      "/",
      newData,
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
      "/" + slug,
      updateData,
    );
    return CalloutClient.deserialize(data);
  }

  /**
   * Delete a callout
   * @param slug The slug of the callout to delete
   */
  async delete(slug: string) {
    await this.fetch.delete(
      "/" + slug,
    );
  }

  /**
   * List responses for a callout
   * @param slug The slug of the callout
   * @param query Optional query parameters
   * @param _with Optional relations to include
   */
  async listResponses<With extends GetCalloutResponseWith = void>(
    slug: string,
    query?: GetCalloutResponsesQuery,
    _with?: readonly With[],
  ): Promise<Paginated<GetCalloutResponseDataWith<With>>> {
    const { data } = await this.fetch.get<
      Paginated<Serial<GetCalloutResponseDataWith<With>>>
    >(
      `/${slug}/responses`,
      { params: { with: _with, ...query } },
    );
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
    query?: GetCalloutResponsesQuery,
  ): Promise<Paginated<GetCalloutResponseMapData>> {
    const { data } = await this.fetch.get<
      Paginated<Serial<GetCalloutResponseMapData>>
    >(
      `/${slug}/responses/map`,
      { params: query },
    );
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
      "answers" | "guestEmail" | "guestName"
    >,
    captchaToken?: string,
  ): Promise<void> {
    await this.fetch.post(
      `/${slug}/responses`,
      {
        answers: newData.answers,
        guestName: newData.guestName,
        guestEmail: newData.guestEmail,
      },
      { params: { captchaToken } },
    );
  }
}
