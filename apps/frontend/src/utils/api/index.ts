import axios, { type AxiosResponse } from 'axios';
import env from '@env';
import { addNotification } from '@store/notifications';
import i18n from '../../lib/i18n';
import { parseISO } from 'date-fns';

import type { ApiRequestError } from '@type/api-request-error';
import type { ApiError } from '@type/api-error';

export function isRequestError<Code extends string>(
  err: unknown,
  codes?: Code[]
): err is ApiRequestError<Code, 400>;
export function isRequestError<Code extends string, Status extends number>(
  err: unknown,
  codes: Code[] | undefined,
  status: Status[]
): err is ApiRequestError<Code, Status>;
export function isRequestError<Code extends string, Status extends number>(
  err: unknown,
  codes: string[] = [],
  status: Status[] = [400] as Status[]
): err is ApiRequestError<Code, Status> {
  if (
    axios.isAxiosError(err) &&
    typeof err.response?.status === 'number' &&
    status.includes(err.response.status as Status)
  ) {
    const data = err.response.data as ApiError<Code>;
    return !codes.length || codes.includes(data.code);
  }

  return false;
}

export function deserializeDate(s: string): Date;
export function deserializeDate<T extends null | undefined>(
  s: string | T
): Date | T;
export function deserializeDate<T extends null | undefined>(
  s: string | T
): Date | T {
  return s == null ? s : parseISO(s);
}

export const instance = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    'X-Beabee-Version': `${env.version} / ${env.revision}`,
  },
});

instance.interceptors.request.use((config) => {
  // Rules are sent as JSON object string
  if (config.params?.rules) {
    config.params.rules = JSON.stringify(config.params.rules);
  }
  return config;
});

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (!error.response || error.response.status >= 500) {
      addNotification({
        variant: 'error',
        title: i18n.global.t(
          'notification.error',
          'Something went wrong, please try again.'
        ),
      });
    }

    return Promise.reject(error);
  }
);
