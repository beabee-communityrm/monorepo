/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormioFile } from '@beabee/beabee-common';
import {
  MAX_FILE_SIZE_IN_BYTES,
  isSupportedDocumentExtension,
  isSupportedDocumentType,
  isSupportedImageExtension,
  isSupportedImageType,
} from '@beabee/beabee-common';
import { ClientApiError } from '@beabee/client';

import { i18n } from '@lib/i18n';
import { client } from '@utils/api';
import { ref } from 'vue';

const { t } = i18n.global;

/**
 * Global reactive counter for tracking active file uploads
 * This is used by FormRenderer to disable form submission during uploads
 */
export const activeUploadsCount = ref(0);

export default class BeabeeStorage {
  static get title() {
    return 'beabee';
  }

  async uploadFile(
    file: File,
    name: string,
    dir: string,
    progressCallback: any,
    url: any,
    options: any,
    fileKey: any,
    groupPermssions: any,
    groupId: any,
    abortCallback: any
  ): Promise<FormioFile> {
    // Increment upload counter at the start
    activeUploadsCount.value++;

    try {
      // Check file size
      if (file.size >= MAX_FILE_SIZE_IN_BYTES) {
        throw new Error(t('form.errors.file.tooBig'));
      }

      // Check file type and extension - must be either a supported document or image
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isValidDocument =
        isSupportedDocumentType(file.type) ||
        (fileExtension && isSupportedDocumentExtension(fileExtension));
      const isValidImage =
        isSupportedImageType(file.type) ||
        (fileExtension && isSupportedImageExtension(fileExtension));

      if (!isValidDocument && !isValidImage) {
        throw new Error(t('form.errors.file.unsupportedType'));
      }

      const controller = new AbortController();
      if (typeof abortCallback === 'function') {
        abortCallback(() => controller.abort());
      }

      // Direct upload with the new ImageService
      const response = await client.upload.uploadFile(file);

      return {
        storage: 'beabee',
        name,
        url: response.url,
        path: response.path,
        size: file.size,
        hash: response.hash,
        originalName: file.name,
      };
    } catch (err) {
      if (err instanceof ClientApiError) {
        if (err.code === 'TOO_MANY_REQUESTS' || err.httpCode === 429) {
          throw new Error(t('form.errors.file.rateLimited'));
        } else if (err.code === 'LIMIT_FILE_SIZE' || err.httpCode === 413) {
          throw new Error(t('form.errors.file.tooBig'));
        } else if (
          err.code === 'UNSUPPORTED_FILE_TYPE' ||
          err.httpCode === 415
        ) {
          throw new Error(t('form.errors.file.unsupportedType'));
        }
      }
      throw new Error(t('form.errorMessages.generic'));
    } finally {
      // Always decrement counter when upload completes (success or failure)
      activeUploadsCount.value--;
    }
  }

  async deleteFile() {
    // TODO: https://github.com/beabee-communityrm/monorepo/issues/181
    throw new Error('Not implemented');
  }

  async downloadFile(file: FormioFile) {
    return file;
  }
}
