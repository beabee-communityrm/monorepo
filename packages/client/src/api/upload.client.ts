import type { GetUploadFlowData, Serial } from "@beabee/beabee-common";
import type { BaseClientOptions } from "../types/index.js";
import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";

/**
 * Client for managing file uploads
 */
export class UploadClient extends BaseClient {
  /**
   * Creates a new upload client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    options.path = cleanUrl(options.path + "/upload");
    super(options);
  }

  /**
   * Creates a new upload flow
   * @returns Upload flow data
   */
  async createFlow(): Promise<GetUploadFlowData> {
    const { data } = await this.fetch.post<Serial<GetUploadFlowData>>("");
    return data;
  }
}
