import { instance } from '.';
import type {
  TagCreateData,
  TagGetData,
  Serial,
  TagUpdateData,
} from '@beabee/beabee-common';

/**
 * Abstract class for tag operations
 * @deprecated Use the TagClient from the @beabee/client package instead
 */
export abstract class TagOperations {
  abstract getBasePath(entityId: string | undefined): string;

  async fetchTags(entityId?: string): Promise<TagGetData[]> {
    const { data } = await instance.get<Serial<TagGetData>[]>(
      this.getBasePath(entityId),
      {
        params: {
          sort: 'name',
          order: 'ASC',
        },
      }
    );
    return data;
  }

  /** @deprecated Use the '@beabee/client' package instead */
  async createTag(
    entityId: string | undefined,
    dataIn: TagCreateData
  ): Promise<TagGetData> {
    const { data } = await instance.post<Serial<TagGetData>>(
      this.getBasePath(entityId),
      {
        name: dataIn.name,
        description: dataIn.description,
      }
    );
    return data;
  }

  /** @deprecated Use the '@beabee/client' package instead */
  async updateTag(
    entityId: string | undefined,
    tagId: string,
    dataIn: TagUpdateData
  ): Promise<TagGetData> {
    const { data } = await instance.patch<Serial<TagGetData>>(
      `${this.getBasePath(entityId)}/${tagId}`,
      {
        name: dataIn.name,
        description: dataIn.description,
      }
    );
    return data;
  }

  /** @deprecated Use the '@beabee/client' package instead */
  async deleteTag(entityId: string | undefined, tagId: string): Promise<void> {
    await instance.delete(`${this.getBasePath(entityId)}/${tagId}`);
  }
}
