import { BaseClient } from "./base.client.ts";
import { cleanUrl } from "../utils/index.ts";
import { ContactClient } from "./contact.client.ts";
import type { BaseClientOptions } from "../types/index.ts";
import type {
  CreateCalloutResponseCommentData,
  GetCalloutResponseCommentData,
  GetCalloutResponseCommentsQuery,
  Paginated,
  Serial,
  UpdateCalloutResponseCommentData,
} from "../deps.ts";

/**
 * Client for managing callout response comments
 */
export class CalloutResponseCommentClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/callout-response-comments");
    super(options);
  }

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

  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }

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
