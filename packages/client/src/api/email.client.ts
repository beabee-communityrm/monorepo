import { BaseClient } from "./base.client.ts";
import { cleanUrl } from "../utils/index.ts";
import type { BaseClientOptions } from "../types/index.ts";
import type { GetEmailData, UpdateEmailData } from "../deps.ts";

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
    options.path = cleanUrl(options.path + "/email");
    super(options);
  }

  /**
   * Retrieves email data by ID
   * @param id - The email ID to fetch
   * @returns The email data or false if not found
   */
  async get(id: string): Promise<GetEmailData | false> {
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
      data,
    );
    return responseData;
  }
}
