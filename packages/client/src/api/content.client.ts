import { BaseClient } from './base.client.js';
import { cleanUrl } from '../utils/index.js';

import type { BaseClientOptions } from '../types/index.js';
import type { ContentData, ContentId } from '@beabee/beabee-common';

/**
 * Client for managing content pages and blocks
 * Handles creation, retrieval, and updates of content elements in the CMS
 * @extends BaseClient
 * @template Id - The type of content identifier (e.g., slug or ID)
 */
export class ContentClient extends BaseClient {
  /**
   * Creates a new content client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/content'),
    });
  }

  /**
   * Deserializes content data from the server response
   * @template Id - The type of content identifier
   * @param content - The content data to deserialize
   * @returns The deserialized content
   */
  static deserialize<Id extends ContentId>(content: ContentData<Id>) {
    return content;
  }

  /**
   * Retrieves content by its identifier
   * @template Id - The type of content identifier
   * @param id - The content identifier (slug or ID)
   * @returns The content data
   */
  async get<Id extends ContentId>(id: Id): Promise<ContentData<Id>> {
    const { data } = await this.fetch.get<ContentData<Id>>(`/${id}`);
    return data;
  }

  /**
   * Updates existing content
   * @template Id - The type of content identifier
   * @param id - The content identifier
   * @param content - Partial content data to update
   * @returns The server response
   */
  async update<Id extends ContentId>(
    id: Id,
    content: Partial<ContentData<Id>>
  ): Promise<ContentData<Id>> {
    const { data } = await this.fetch.patch<ContentData<Id>>(`/${id}`, content);
    return data;
  }
}
