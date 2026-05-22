import {
  MAX_FILE_SIZE_IN_BYTES,
  type UploadFileResponse,
  isSupportedDocumentType,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import {
  FileTooLargeError,
  UnsupportedFileTypeError,
  cleanUrl,
} from '../utils/index.js';
import { BaseClient } from './base.client.js';

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
      path: cleanUrl(options.path + '/documents'),
    });
  }

  /**
   * Uploads a document file
   * @param file - The document file to upload
   * @returns The uploaded document ID and URL
   * @throws {ApiError} If the file is too large or rate limit is exceeded
   */
  async uploadFile(file: File): Promise<UploadFileResponse> {
    // Check file size (20MB limit)
    if (file.size >= MAX_FILE_SIZE_IN_BYTES) {
      throw new FileTooLargeError('File too large');
    }

    if (!isSupportedDocumentType(file.type)) {
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
