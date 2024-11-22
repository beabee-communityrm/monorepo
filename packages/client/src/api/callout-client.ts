import { BaseClient } from "./base-client.ts";
import { cleanUrl } from "../utils/index.ts";

import type { BaseClientOptions } from "../types/index.ts";

import type {
  CreateCalloutData,
  GetCalloutData,
  GetCalloutDataWith,
  GetCalloutsQuery,
  GetCalloutWith,
  Paginated,
  Serial,
  UpdateCalloutData,
} from "../deps.ts";

export class CalloutClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    // e.g. `/api/1.0/callout`
    options.path = cleanUrl(options.path + "/callout");
    super(options);
  }

  protected deserialize<With extends GetCalloutWith = void>(
    _callout: Serial<GetCalloutDataWith<With>>,
  ): GetCalloutDataWith<With>;

  /**
   * Deserialize a callout
   * @param callout The callout to deserialize
   * @returns The deserialized callout
   */
  protected deserialize(_callout: Serial<GetCalloutData>): GetCalloutData {
    const callout: GetCalloutData = {
      ..._callout,
      starts: this.deserializeDate(_callout.starts),
      expires: this.deserializeDate(_callout.expires),
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
    return this.deserialize(data);
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
    const items = data.items.map((item) => this.deserialize(item));
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
    return this.deserialize(data);
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
}
