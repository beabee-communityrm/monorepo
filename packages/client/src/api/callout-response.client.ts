import { BaseClient } from "./base.client.ts";
import { cleanUrl } from "../utils/index.ts";
import { ContactClient } from "./contact.client.ts";
import { CalloutResponseCommentClient } from "./callout-response-comment.client.ts";

import type { BaseClientOptions } from "../types/index.ts";
import type {
  GetCalloutResponseData,
  GetCalloutResponseDataWith,
  GetCalloutResponsesQuery,
  GetCalloutResponseWith,
  Paginated,
  RuleGroup,
  Serial,
  UpdateCalloutResponseData,
} from "../deps.ts";

export class CalloutResponseClient extends BaseClient {
  comment: CalloutResponseCommentClient;

  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/callout-responses");
    super(options);
    this.comment = new CalloutResponseCommentClient(options);
  }

  static deserialize<With extends GetCalloutResponseWith = void>(
    // TODO: how to make this type safe like Serial<GetCalloutResponseDataWith<With>>
    // deno-lint-ignore no-explicit-any
    response: any,
  ): GetCalloutResponseDataWith<With> {
    return {
      ...response,
      createdAt: CalloutResponseClient.deserializeDate(response.createdAt),
      updatedAt: CalloutResponseClient.deserializeDate(response.updatedAt),
      ...(response.assignee && {
        assignee: ContactClient.deserialize(response.assignee),
      }),
      ...(response.contact && {
        contact: ContactClient.deserialize(response.contact),
      }),
      ...(response.latestComment && {
        latestComment: CalloutResponseCommentClient.deserialize(
          response.latestComment,
        ),
      }),
    };
  }

  async list<With extends GetCalloutResponseWith = void>(
    query?: GetCalloutResponsesQuery,
    _with?: readonly With[],
  ): Promise<Paginated<GetCalloutResponseDataWith<With>>> {
    const { data } = await this.fetch.get<
      Paginated<Serial<GetCalloutResponseDataWith<With>>>
    >("", { params: { with: _with, ...query } });

    return {
      ...data,
      items: data.items.map((item) => CalloutResponseClient.deserialize(item)),
    };
  }

  async updates(
    rules: RuleGroup,
    updates: UpdateCalloutResponseData,
  ): Promise<{ affected: number }> {
    const { data } = await this.fetch.patch<Serial<{ affected: number }>>("", {
      rules,
      updates,
    });
    return data;
  }

  async get<With extends GetCalloutResponseWith = void>(
    id: string,
    _with?: readonly With[],
  ): Promise<GetCalloutResponseDataWith<With>> {
    const { data } = await this.fetch.get<
      Serial<GetCalloutResponseDataWith<With>>
    >(
      `/${id}`,
      undefined,
      { params: { with: _with } },
    );
    return CalloutResponseClient.deserialize<With>(data);
  }

  async update(
    id: string,
    dataIn: UpdateCalloutResponseData,
  ): Promise<GetCalloutResponseData> {
    const { data } = await this.fetch.patch<Serial<GetCalloutResponseData>>(
      `/${id}`,
      dataIn,
    );
    return CalloutResponseClient.deserialize(data);
  }
}
