import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";

import type { BaseClientOptions } from "../types/index.js";
import type {
  CreateApiKeyData,
  GetApiKeyData,
  GetApiKeysQuery,
  Paginated,
  Serial
} from "../deps.js";

export class ApiKeyClient extends BaseClient {
  /**
   * Creates a new API key client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/api-key");
    super(options);
  }

  /**
   * Deserializes an API key from the server response
   * @param apiKey - The serialized API key data
   * @returns The deserialized API key data
   */
  static deserialize(apiKey: Serial<GetApiKeyData>): GetApiKeyData {
    return {
      ...apiKey,
      createdAt: this.deserializeDate(apiKey.createdAt),
      expires: this.deserializeDate(apiKey.expires)
    };
  }

  /**
   * Creates a new API key
   * @param newData - The data for creating the new API key
   * @returns The created API key
   */
  async create(newData: CreateApiKeyData): Promise<{ token: string }> {
    const { data } = await this.fetch.post<Serial<{ token: string }>>(
      "",
      newData
    );
    return data;
  }

  /**
   * Lists all API keys with optional filtering
   * @param query - Optional query parameters for filtering the list
   * @returns A paginated list of API keys
   */
  async list(query?: GetApiKeysQuery): Promise<Paginated<GetApiKeyData>> {
    const { data } = await this.fetch.get<Paginated<Serial<GetApiKeyData>>>(
      "",
      { params: query }
    );

    return {
      ...data,
      items: data.items.map((item) => ApiKeyClient.deserialize(item))
    };
  }

  /**
   * Deletes an API key
   * @param id - The ID of the API key to delete
   */
  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }
}
