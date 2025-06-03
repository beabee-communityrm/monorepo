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
 * @param onProgress - Optional callback to report progress (0-100) and status message
 * @param maxRetries - Optional maximum number of retries (default: 60)
 */
export async function waitForBackend(
  onProgress?: (progress: number, message: string) => void,
  maxRetries: number = 60
): Promise<void> {
  console.log('[waitForBackend] Starting backend health check...');
  const retryDelay = 1000; // 1 second between retries
  let retries = 0;
  let wasUnhealthy = false;

  while (retries < maxRetries) {
    try {
      // Report progress
      const progress = Math.min((retries / maxRetries) * 100, 95);
      onProgress?.(
        progress,
        `Checking backend health... (attempt ${retries + 1})`
      );

      console.log(
        `[waitForBackend] Attempt ${retries + 1}/${maxRetries} - Checking health...`
      );
      const health = await client.health.check();
      console.log('[waitForBackend] Health check response:', health);

      if (health.status === 'ok') {
        // Backend is healthy
        console.log('[waitForBackend] Backend is healthy!');
        onProgress?.(100, 'Backend connected successfully!');

        // If backend was unhealthy before but is now healthy, refresh the browser
        if (wasUnhealthy) {
          console.log('[waitForBackend] Backend recovered, reloading page...');
          window.location.reload();
          return;
        }

        return;
      }
      // Backend is unhealthy
      console.warn('[waitForBackend] Backend is unhealthy:', health);
      wasUnhealthy = true;
      onProgress?.(progress, 'Backend is unhealthy, retrying...');
    } catch (error) {
      // Backend health check failed
      console.error('[waitForBackend] Health check failed:', error);
      wasUnhealthy = true;
      const progress = Math.min((retries / maxRetries) * 100, 95);
      onProgress?.(progress, 'Unable to reach backend, retrying...');
    }

    retries++;
    if (retries < maxRetries) {
      console.log(`[waitForBackend] Waiting ${retryDelay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  console.error('[waitForBackend] Maximum retries reached, throwing error');
  throw new Error('Backend failed to become healthy after maximum retries');
}

export { isApiError, ClientApiError };
