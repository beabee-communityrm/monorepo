import {
  type UploadFileResponse,
  isSupportedDocumentType,
  isSupportedImageType,
} from '@beabee/beabee-common';

import type { BaseClientOptions } from '../types/index.js';
import { ClientApiError } from '../utils/index.js';
import { UploadDocumentClient } from './upload-document.client.js';
import { UploadImageClient } from './upload-image.client.js';

/**
 * Client for managing file uploads
 * Acts as a wrapper for specialized upload clients
 */
export class UploadClient {
  private readonly imageClient: UploadImageClient;
  private readonly documentClient: UploadDocumentClient;

  get image() {
    return this.imageClient;
  }

  get document() {
    return this.documentClient;
  }

  /**
   * Creates a new upload client
   * @param options - The client options
   */
  constructor(protected readonly options: BaseClientOptions) {
    this.imageClient = new UploadImageClient(options);
    this.documentClient = new UploadDocumentClient(options);
  }

  /**
   * Uploads a file by selecting the appropriate client based on file type
   * @param file - The file to upload
   * @returns The uploaded file ID and URL
   * @throws {ClientApiError} If the file is too large, not supported, or rate limit is exceeded
   */
  async uploadFile(file: File): Promise<UploadFileResponse> {
    // Check if the file is an image or a document
    if (isSupportedImageType(file.type)) {
      return this.imageClient.uploadFile(file);
    } else if (isSupportedDocumentType(file.type)) {
      return this.documentClient.uploadFile(file);
    } else {
      throw new ClientApiError('Unsupported file type', {
        httpCode: 415,
        code: 'UNSUPPORTED_FILE_TYPE',
      });
    }
  }
}
