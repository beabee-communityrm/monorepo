import { BeabeeClient, isApiError, ClientApiError } from '@beabee/client';
import env from '@env';
import { addNotification } from '@beabee/vue/store/notifications';
import { i18n } from '../../lib/i18n';

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
        'notifications.error',
        'Something went wrong, please try again.'
      ),
    });
  }
  throw error;
});

/**
 * Wait for backend to be healthy before starting the app
 */
export async function waitForBackend(): Promise<void> {
  const maxRetries = 60; // 60 seconds total
  const retryDelay = 1000; // 1 second between retries
  let retries = 0;
  let wasUnhealthy = false;

  while (retries < maxRetries) {
    try {
      const health = await client.health.check();
      if (health.status === 'ok') {
        // Backend is healthy

        // If backend was unhealthy before but is now healthy, refresh the browser
        if (wasUnhealthy) {
          window.location.reload();
          return;
        }

        return;
      }
      // Backend is unhealthy
      wasUnhealthy = true;
    } catch {
      // Backend health check failed
      wasUnhealthy = true;
    }

    retries++;
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  throw new Error('Backend failed to become healthy after maximum retries');
}

export { isApiError, ClientApiError };
