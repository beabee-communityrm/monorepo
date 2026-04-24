import {
  MAX_FILE_SIZE_IN_BYTES,
  type UploadFileResponse,
  isSupportedImageType,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import {
  FileTooLargeError,
  UnsupportedFileTypeError,
  cleanUrl,
} from '../utils/index.js';
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
   * @throws {ApiError} If the file is too large or rate limit is exceeded
   */
  async uploadFile(file: File): Promise<UploadFileResponse> {
    // Check file size (20MB limit)
    if (file.size >= MAX_FILE_SIZE_IN_BYTES) {
      throw new FileTooLargeError('File too large');
    }

    if (!isSupportedImageType(file.type)) {
      throw new UnsupportedFileTypeError('Unsupported file type', file.type);
    }

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await this.fetch.post<UploadFileResponse>('', formData, {
      dataType: 'multipart',
    });

    return data;
  }
}
