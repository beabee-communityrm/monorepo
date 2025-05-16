/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from '@utils/api';
import { i18n } from '@lib/i18n';
import type { FormioFile } from '@beabee/beabee-common';
import { ClientApiError } from '@beabee/client';
import {
  MAX_FILE_SIZE_IN_BYTES,
  isSupportedDocumentType,
  isSupportedDocumentExtension,
} from '@beabee/beabee-common';

const { t } = i18n.global;

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
    // Check file size
    if (file.size >= MAX_FILE_SIZE_IN_BYTES) {
      throw new Error(t('form.errors.file.tooBig'));
    }

    // Check file type and extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (
      !isSupportedDocumentType(file.type) &&
      (!fileExtension || !isSupportedDocumentExtension(fileExtension))
    ) {
      throw new Error(t('form.errors.file.unsupportedType'));
    }

    const controller = new AbortController();
    if (typeof abortCallback === 'function') {
      abortCallback(() => controller.abort());
    }

    try {
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
