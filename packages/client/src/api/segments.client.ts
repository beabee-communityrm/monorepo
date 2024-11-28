import type {
  CreateSegmentData,
  GetSegmentDataWith,
  GetSegmentsQuery,
  GetSegmentWith,
  Serial,
  UpdateSegmentData,
} from "@beabee/beabee-common";
import type { BaseClientOptions } from "../types/index.ts";
import { BaseClient } from "./base.client.ts";
import { cleanUrl } from "../utils/index.ts";

export class SegmentsPort extends BaseClient {
  /**
   * Creates a new payment client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/segments");
    super(options);
  }

  async list<With extends GetSegmentWith = void>(
    query?: GetSegmentsQuery,
    _with?: readonly With[],
  ): Promise<GetSegmentDataWith<With>[]> {
    const { data } = await this.fetch.get<Serial<GetSegmentDataWith<With>>[]>(
      "",
      {
        params: { with: _with, ...query },
      },
    );
    // TODO: needs Serial type guard
    return data as GetSegmentDataWith<With>[];
  }

  async get<With extends GetSegmentWith = void>(
    id: string,
    _with?: readonly With[],
  ): Promise<GetSegmentDataWith<With>> {
    const { data } = await this.fetch.get<Serial<GetSegmentDataWith<With>>>(
      `/${id}`,
      {
        params: { with: _with },
      },
    );
    // TODO: needs Serial type guard
    return data as GetSegmentDataWith<With>;
  }

  async create(
    input: CreateSegmentData,
  ): Promise<GetSegmentDataWith<"contactCount">> {
    const { data } = await this.fetch.post<
      Serial<GetSegmentDataWith<"contactCount">>
    >("", {
      name: input.name,
      order: input.order,
      ruleGroup: input.ruleGroup,
      description: "", // TODO: deprecated from API
    });
    return data;
  }

  async update(
    id: string,
    input: UpdateSegmentData,
  ): Promise<GetSegmentDataWith<"contactCount">> {
    const { data } = await this.fetch.patch<
      Serial<GetSegmentDataWith<"contactCount">>
    >(`/${id}`, {
      name: input.name,
      order: input.order,
      ruleGroup: input.ruleGroup,
    });
    return data;
  }

  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }
}
