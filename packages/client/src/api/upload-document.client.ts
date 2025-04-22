import type { BaseClientOptions } from "../types/index.js";
import {
  type UploadFileResponse,
  isSupportedDocumentType
} from "@beabee/beabee-common";
import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import { ClientApiError } from "../utils/index.js";

/**
 * Client for managing document uploads
 */
export class UploadDocumentClient extends BaseClient {
  /**
   * Creates a new document upload client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + "/documents")
    });
  }

  /**
   * Uploads a document file
   * @param file - The document file to upload
   * @returns The uploaded document ID and URL
   * @throws {ClientApiError} If the file is too large or rate limit is exceeded
   */
  async uploadFile(file: File): Promise<UploadFileResponse> {
    // Check file size (20MB limit)
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (file.size >= MAX_FILE_SIZE) {
      throw new ClientApiError("File too large", {
        httpCode: 413,
        code: "LIMIT_FILE_SIZE"
      });
    }

    if (!isSupportedDocumentType(file.type)) {
      throw new ClientApiError("Unsupported file type", {
        httpCode: 415,
        code: "UNSUPPORTED_FILE_TYPE"
      });
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await this.fetch.post<UploadFileResponse>("", formData, {
        dataType: "multipart"
      });

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
