import {
  MAX_FONT_SIZE_IN_BYTES,
  type UploadFileResponse,
  isSupportedFontType,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import {
  FileTooLargeError,
  UnsupportedFileTypeError,
  cleanUrl,
} from '../utils/index.js';
import { BaseClient } from './base.client.js';

/**
 * Client for managing theme font uploads
 */
export class UploadFontClient extends BaseClient {
  /**
   * Creates a new font upload client
   * @param options - The client options
   */
  constructor(protected override readonly options: BaseClientOptions) {
    super({
      ...options,
      path: cleanUrl(options.path + '/fonts'),
    });
  }

  /**
   * Uploads a font file
   * @param file - The WOFF2 font file to upload
   * @returns The uploaded font ID and URL
   * @throws {ApiError} If the file is too large or not a supported font
   */
  async uploadFile(file: File): Promise<UploadFileResponse> {
    if (file.size > MAX_FONT_SIZE_IN_BYTES) {
      throw new FileTooLargeError('File too large');
    }

    if (!isSupportedFontType(file.type)) {
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
