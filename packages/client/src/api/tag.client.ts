import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import type { BaseClientOptions } from "../types/index.js";
import type {
  TagCreateData,
  TagGetData,
  TagUpdateData
} from "@beabee/beabee-common";

/**
 * Client for managing tag operations
 */
export abstract class TagClient extends BaseClient {
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path ?? "")
    });
  }

  protected abstract getBasePath(entityId: string | undefined): string;

  /**
   * Fetch all tags
   * @param entityId Optional entity ID to filter tags
   * @returns List of tags
   */
  async list(entityId?: string): Promise<TagGetData[]> {
    const { data } = await this.fetch.get<TagGetData[]>(
      this.getBasePath(entityId),
      {
        sort: "name",
        order: "ASC"
      }
    );
    return data;
  }

  /**
   * Create a new tag
   * @param entityId Optional entity ID
   * @param tagData The tag data to create
   * @returns The created tag
   */
  async create(
    entityId: string | undefined,
    tagData: TagCreateData
  ): Promise<TagGetData> {
    const { data } = await this.fetch.post<TagGetData>(
      this.getBasePath(entityId),
      tagData
    );
    return data;
  }

  /**
   * Update an existing tag
   * @param entityId Optional entity ID
   * @param tagId The ID of the tag to update
   * @param tagData The updated tag data
   * @returns The updated tag
   */
  async update(
    entityId: string | undefined,
    tagId: string,
    tagData: TagUpdateData
  ): Promise<TagGetData> {
    const { data } = await this.fetch.patch<TagGetData>(
      `${this.getBasePath(entityId)}/${tagId}`,
      tagData
    );
    return data;
  }

  /**
   * Delete a tag
   * @param entityId Optional entity ID
   * @param tagId The ID of the tag to delete
   */
  async delete(entityId: string | undefined, tagId: string): Promise<void> {
    await this.fetch.delete(`${this.getBasePath(entityId)}/${tagId}`);
  }
}
