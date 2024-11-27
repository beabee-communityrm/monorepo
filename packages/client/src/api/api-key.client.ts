import { BaseClient } from "./base.client.ts";
import { cleanUrl } from "../utils/index.ts";

import type { BaseClientOptions } from "../types/index.ts";
import type {
  CreateApiKeyData,
  GetApiKeyData,
  GetApiKeysQuery,
  Paginated,
  Serial,
} from "../deps.ts";

export class ApiKeyClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/api-key");
    super(options);
  }

  static deserialize(apiKey: Serial<GetApiKeyData>): GetApiKeyData {
    return {
      ...apiKey,
      createdAt: this.deserializeDate(apiKey.createdAt),
      expires: this.deserializeDate(apiKey.expires),
    };
  }

  async create(newData: CreateApiKeyData): Promise<{ token: string }> {
    const { data } = await this.fetch.post<Serial<{ token: string }>>(
      "",
      newData,
    );
    return data;
  }

  async list(query?: GetApiKeysQuery): Promise<Paginated<GetApiKeyData>> {
    const { data } = await this.fetch.get<Paginated<Serial<GetApiKeyData>>>(
      "",
      { params: query },
    );

    return {
      ...data,
      items: data.items.map((item) => ApiKeyClient.deserialize(item)),
    };
  }

  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }
}
