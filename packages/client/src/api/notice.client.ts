import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import type { BaseClientOptions } from "../types/index.js";
import type {
  CreateNoticeData,
  GetNoticeData,
  GetNoticesQuery,
  Paginated,
  Serial
} from "@beabee/beabee-common";

/**
 * Client for managing dashboard notices
 * Handles creation, retrieval, updates and deletion of notices
 * @extends BaseClient
 */
export class NoticeClient extends BaseClient {
  /**
   * Creates a new notice client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + "/notice")
    });
  }

  /**
   * Deserializes a notice from the server response
   * Converts date strings to Date objects
   * @param notice - The serialized notice data
   * @returns The deserialized notice with proper date objects
   */
  protected deserialize(notice: Serial<GetNoticeData>): GetNoticeData {
    return {
      ...notice,
      createdAt: NoticeClient.deserializeDate(notice.createdAt),
      updatedAt: NoticeClient.deserializeDate(notice.updatedAt),
      starts: NoticeClient.deserializeDate(notice.starts),
      expires: NoticeClient.deserializeDate(notice.expires)
    };
  }

  /**
   * Lists all notices with optional filtering
   * @param query - Optional query parameters for filtering notices
   * @returns A paginated list of notices
   */
  async list(query: GetNoticesQuery = {}): Promise<Paginated<GetNoticeData>> {
    const { data } = await this.fetch.get<Paginated<Serial<GetNoticeData>>>(
      "",
      query
    );

    return {
      ...data,
      items: data.items.map((notice) => this.deserialize(notice))
    };
  }

  /**
   * Gets a single notice by ID
   * @param id - The ID of the notice to retrieve
   * @returns The notice data
   */
  async get(id: string): Promise<GetNoticeData> {
    const { data } = await this.fetch.get<Serial<GetNoticeData>>(`/${id}`);
    return this.deserialize(data);
  }

  /**
   * Creates a new notice
   * @param data - The notice data to create
   * @returns The created notice
   */
  async create(data: CreateNoticeData): Promise<GetNoticeData> {
    const { data: responseData } = await this.fetch.post<Serial<GetNoticeData>>(
      "",
      data
    );
    return this.deserialize(responseData);
  }

  /**
   * Updates an existing notice
   * @param id - The ID of the notice to update
   * @param data - The update data
   * @returns The updated notice
   */
  async update(id: string, data: CreateNoticeData): Promise<GetNoticeData> {
    const { data: responseData } = await this.fetch.patch<
      Serial<GetNoticeData>
    >(`/${id}`, data);
    return this.deserialize(responseData);
  }

  /**
   * Deletes a notice
   * @param id - The ID of the notice to delete
   */
  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }
}
