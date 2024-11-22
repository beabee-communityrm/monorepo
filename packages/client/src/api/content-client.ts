import { BaseClient } from "./base-client.ts";
import { cleanUrl } from "../utils/index.ts";

import type { BaseClientOptions } from "../types/index.ts";
import type { ContentData, ContentId } from "../deps.ts";

export class ContentClient extends BaseClient {
  constructor(protected readonly options: BaseClientOptions) {
    // e.g. `/api/1.0/content`
    options.path = cleanUrl(options.path + "/content");
    super(options);
  }

  protected deserialize<Id extends ContentId>(content: ContentData<Id>) {
    return content;
  }

  async get<Id extends ContentId>(
    id: Id,
  ) {
    const { data } = await this.fetch.get<ContentData<Id>>(
      `/${id}`,
    );
    return this.deserialize(data);
  }

  async update<Id extends ContentId>(
    id: Id,
    content: Partial<ContentData<Id>>,
  ) {
    return await this.fetch.patch(
      `/${id}`,
      content,
    );
  }
}
