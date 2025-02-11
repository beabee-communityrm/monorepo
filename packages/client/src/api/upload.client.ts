import type { GetUploadFlowData, Serial } from "@beabee/beabee-common";
import type { BaseClientOptions } from "../types/index.js";
import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import { ClientApiError } from "../utils/index.js";

/**
 * Client for managing file uploads
 */
export class UploadClient extends BaseClient {
  /**
   * Creates a new upload client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + "/upload")
    });
  }

  /**
   * Creates a new upload flow
   * @returns Upload flow data
   */
  async createFlow(): Promise<GetUploadFlowData> {
    const { data } = await this.fetch.post<Serial<GetUploadFlowData>>("");
    return data;
  }

  /**
   * Uploads a file using the provided upload flow
   * @param file - The file to upload
   * @param flowId - The ID of the upload flow
   * @returns The URL of the uploaded file
   * @throws {ClientApiError} If the file is too large or rate limit is exceeded
   */
  async uploadFile(file: File, flowId: string): Promise<{ url: string }> {
    // Check file size (20MB limit)
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (file.size >= MAX_FILE_SIZE) {
      throw new ClientApiError("File too large", {
        httpCode: 413,
        code: "FILE_TOO_LARGE"
      });
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await this.fetch.post<{ url: string }>(
        "upload/",
        formData,
        {
          params: {
            token: flowId
          },
          basePath: "/", // This removes the /api/1.0/upload prefix from the URL
          dataType: "multipart"
        }
      );

      return data;
    } catch (error) {
      // Rethrow rate limit errors with custom message
      if (error instanceof ClientApiError && error.httpCode === 429) {
        throw new ClientApiError("Rate limit exceeded", {
          httpCode: 429,
          code: "RATE_LIMIT_EXCEEDED"
        });
      }
      throw error;
    }
  }
}
