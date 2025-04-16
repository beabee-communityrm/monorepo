import type { GetUploadFlowData, Serial } from "@beabee/beabee-common";
import type { BaseClientOptions } from "../types/index.js";
import { BaseClient } from "./base.client.js";
import { cleanUrl } from "../utils/index.js";
import { ClientApiError } from "../utils/index.js";

/**
 * Response from uploadFile
 */
export interface UploadFileResponse {
  /** ID des hochgeladenen Bildes */
  id: string;
  /** URL zum hochgeladenen Bild (für Kompatibilität mit altem Client) */
  url: string;
}

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
      path: cleanUrl(options.path + "/images")
    });
  }

  /**
   * Uploads a file using the new image service
   * @param file - The file to upload
   * @returns The uploaded image ID and URL
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

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data } = await this.fetch.post<{ id: string }>("", formData, {
        dataType: "multipart"
      });

      // Für Kompatibilität mit bestehendem Code die URL direkt zurückgeben
      const baseUrl = this.options.basePath || "";
      const url = `${baseUrl}/uploads/${data.id}`;

      return {
        id: data.id,
        url
      };
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

  /**
   * Gets the URL for an image with the specified width
   * @param id - The image ID
   * @param width - The desired width in pixels (optional)
   * @returns The URL of the image
   */
  getImageUrl(id: string, width?: number): string {
    const baseUrl = this.options.basePath || "";
    const url = `${baseUrl}/uploads/${id}`;
    return width ? `${url}?w=${width}` : url;
  }
}
