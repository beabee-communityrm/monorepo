import { BeabeeClient, isApiError, ClientApiError } from '@beabee/client';
import env from '@env';
import { addNotification } from '@store/notifications';
import i18n from '../../lib/i18n';

export const client = new BeabeeClient({
  path: env.apiUrl,
  host: env.appUrl,
  headers: {
    'X-Beabee-Version': `${env.version} / ${env.revision}`,
  },
});

client.fetch.onError((error) => {
  if (error.httpCode && error.httpCode >= 500) {
    addNotification({
      variant: 'error',
      title: i18n.global.t(
        'notification.error',
        'Something went wrong, please try again.'
      ),
    });
  }
  throw error;
});

export { isApiError, ClientApiError };
