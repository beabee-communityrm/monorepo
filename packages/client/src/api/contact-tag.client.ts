import { TagClient } from "./tag.client.ts";
import type { BaseClientOptions } from "../types/index.ts";

/**
 * Client for managing contact tags
 */
export class ContactTagClient extends TagClient {
  /**
   * Creates a new contact tag client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super(options);
  }

  /**
   * Gets the base path for contact tag operations
   * Contact tags are global and don't require a specific contact ID
   * @param contactId - Not used for contact tags, will throw if provided
   * @throws {Error} If contactId is provided, as contact tags are global
   * @returns The API path for contact tag operations
   */
  protected getBasePath(contactId: string | undefined): string {
    if (contactId) {
      throw new Error("Contact ID is not supported");
    }
    return "/contact-tags";
  }
}