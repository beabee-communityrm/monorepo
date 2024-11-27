import { BaseClient } from "./base.client.ts";
import { cleanUrl } from "../utils/index.ts";
import type { BaseClientOptions } from "../types/index.ts";
import type { TagCreateData, TagGetData, TagUpdateData } from "../deps.ts";

/**
 * Client for managing tag operations
 */
export class TagClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/tag");
    super(options);
  }

  /**
   * Fetch all tags
   * @param entityId Optional entity ID to filter tags
   * @returns List of tags
   */
  async list(entityId?: string): Promise<TagGetData[]> {
    const { data } = await this.fetch.get<TagGetData[]>(
      entityId ? `/${entityId}` : "/",
      {
        params: {
          sort: "name",
          order: "ASC",
        },
      },
    );
    return data;
  }

  /**
   * Create a new tag
   * @param tagData The tag data to create
   * @returns The created tag
   */
  async create(tagData: TagCreateData): Promise<TagGetData> {
    const { data } = await this.fetch.post<TagGetData>("/", tagData);
    return data;
  }

  /**
   * Update an existing tag
   * @param id The ID of the tag to update
   * @param tagData The updated tag data
   * @returns The updated tag
   */
  async update(id: string, tagData: TagUpdateData): Promise<TagGetData> {
    const { data } = await this.fetch.patch<TagGetData>(`/${id}`, tagData);
    return data;
  }

  /**
   * Delete a tag
   * @param id The ID of the tag to delete
   */
  async delete(id: string): Promise<void> {
    await this.fetch.delete(`/${id}`);
  }
}
