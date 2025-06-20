import {
  MAX_FILE_SIZE_IN_BYTES,
  type UploadFileResponse,
  isSupportedImageType,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { cleanUrl } from '../utils/index.js';
import { ClientApiError } from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing image uploads
 */
export class UploadImageClient extends BaseClient {
  /**
   * Creates a new image upload client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/images'),
    });
  }

  /**
   * Uploads an image file
   * @param file - The image file to upload
   * @returns The uploaded image ID and URL
   * @throws {ClientApiError} If the file is too large or rate limit is exceeded
   */
  async uploadFile(file: File): Promise<UploadFileResponse> {
    // Check file size (20MB limit)
    if (file.size >= MAX_FILE_SIZE_IN_BYTES) {
      throw new ClientApiError('File too large', {
        httpCode: 413,
        code: 'LIMIT_FILE_SIZE',
      });
    }

    if (!isSupportedImageType(file.type)) {
      throw new ClientApiError('Unsupported file type', {
        httpCode: 415,
        code: 'UNSUPPORTED_FILE_TYPE',
      });
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await this.fetch.post<UploadFileResponse>('', formData, {
        dataType: 'multipart',
      });

      return data;
    } catch (error) {
      // Rethrow rate limit errors with custom message
      if (error instanceof ClientApiError && error.httpCode === 429) {
        throw new ClientApiError('Rate limit exceeded', {
          httpCode: 429,
          code: 'TOO_MANY_REQUESTS',
        });
      }
      throw error;
    }
  }
}
