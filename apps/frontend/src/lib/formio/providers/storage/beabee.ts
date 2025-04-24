/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { client } from '@utils/api';
import { i18n } from '@lib/i18n';

const { t } = i18n.global;

interface BeabeeFile {
  storage: 'beabee';
  name: string;
  url: string;
  size: number;
}

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
  ): Promise<BeabeeFile> {
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

      // Direct access to the URL from the response
      const url = response.url;

      return {
        storage: 'beabee',
        name,
        url,
        size: file.size,
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

  async downloadFile(file: BeabeeFile) {
    return file;
  }
}
