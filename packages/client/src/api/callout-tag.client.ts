import { TagClient } from './tag.client.js';
import type { BaseClientOptions } from '../types/index.js';

/**
 * Client for managing tags associated with callouts
 */
export class CalloutTagClient extends TagClient {
  /**
   * Creates a new callout tag client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super(options);
  }

  /**
   * Gets the base path for tag operations on a specific callout
   * Used internally to construct API endpoints
   * @param entityId - The ID or slug of the callout
   * @returns The API path for callout tag operations
   */
  protected override getBasePath(entityId: string | undefined): string {
    return `/callout/${entityId}/tags`;
  }
}
