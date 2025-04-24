/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { client } from '@utils/api';
import { i18n } from '@lib/i18n';
import type { FormioFile } from '@beabee/beabee-common';

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
    if (file.size >= 20 * 1024 * 1024) {
      throw new Error(t('form.errors.file.tooBig'));
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
        size: file.size,
        hash: response.hash,
        originalName: file.name,
      };
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        throw new Error(t('form.errors.file.rateLimited'));
      } else {
        throw new Error(t('form.errorMessages.generic'));
      }
    }
  }

  async deleteFile() {
    throw new Error('Not implemented');
  }

  async downloadFile(file: FormioFile) {
    return file;
  }
}
