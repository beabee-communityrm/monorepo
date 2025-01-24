import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import type { BaseClientOptions } from "../types/index.js";
import type { GetEmailData, UpdateEmailData } from "@beabee/beabee-common";

/**
 * Client for managing email operations
 * Handles email retrieval and updates
 * @extends BaseClient
 */
export class EmailClient extends BaseClient {
  /**
   * Creates a new email client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + "/email")
    });
  }

  /**
   * Retrieves email data by ID
   * @param id - The email ID to fetch
   * @returns The email data
   */
  async get(id: string): Promise<GetEmailData> {
    const { data } = await this.fetch.get<GetEmailData>(`/${id}`);
    return data;
  }

  /**
   * Updates an existing email
   * @param id - The email ID to update
   * @param data - The update data for the email
   * @returns The updated email data
   */
  async update(id: string, data: UpdateEmailData): Promise<GetEmailData> {
    const { data: responseData } = await this.fetch.put<GetEmailData>(
      `/${id}`,
      data
    );
    return responseData;
  }
}
