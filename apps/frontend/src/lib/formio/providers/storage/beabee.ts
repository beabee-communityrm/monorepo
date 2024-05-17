/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { createUploadFlow } from '../../../../utils/api/upload';
import env from '../../../../env';
import i18n from '../../../i18n';

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

    const uploadFlow = await createUploadFlow();

    const data = new FormData();
    data.append('file', file);

    const controller = new AbortController();
    if (typeof abortCallback === 'function') {
      abortCallback(() => controller.abort());
    }

    try {
      const resp = await axios.post('/upload/', data, {
        baseURL: env.appUrl,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: {
          token: uploadFlow.id,
        },
        signal: controller.signal,
      });

      return {
        storage: 'beabee',
        name,
        url: resp.data.url,
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
