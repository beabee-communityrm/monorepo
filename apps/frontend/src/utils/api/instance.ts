import axios, { type AxiosResponse } from 'axios';
import env from '@env';
import { addNotification } from '@store/notifications';
import i18n from '../../lib/i18n';

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
