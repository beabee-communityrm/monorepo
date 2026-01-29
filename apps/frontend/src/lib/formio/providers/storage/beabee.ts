/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FormioFile } from '@beabee/beabee-common';
import {
  MAX_FILE_SIZE_IN_BYTES,
  isSupportedDocumentExtension,
  isSupportedDocumentType,
  isSupportedImageExtension,
  isSupportedImageType,
} from '@beabee/beabee-common';

import { i18n } from '@lib/i18n';
import { client } from '@utils/api';
import { extractErrorText } from '@utils/api-error';
import { ref } from 'vue';

const { t } = i18n.global;

/**
 * Global reactive counter for tracking active file uploads
 * This is used by FormRenderer to disable form submission during uploads
 */
export const activeUploadsCount = ref(0);

/**
 * Reset the active uploads counter to 0
 * This should be called when navigating to a new form to ensure no stale counts
 */
export const resetActiveUploadsCount = () => {
  activeUploadsCount.value = 0;
};

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
      const errorText = extractErrorText(err, {
        TOO_MANY_REQUESTS: t('form.errors.file.rateLimited'),
        LIMIT_FILE_SIZE: t('form.errors.file.tooBig'),
        UNSUPPORTED_FILE_TYPE: t('form.errors.file.unsupportedType'),
      });
      throw new Error(errorText);
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
