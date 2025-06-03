import { createApp } from 'vue';

import App from './App.vue';

import { i18n } from './lib/i18n';
import router from './lib/router';

import '@beabee/vue/lib/theme';
import { icons } from '@beabee/vue/plugins/icons';

import '@iframe-resizer/child';

import './index.css';

import { init as initErrorHandler } from './lib/appsignal';
import { BeabeeClient } from '@beabee/client';
import env from '@env';

/**
 * Wait for backend to be healthy before starting the app
 */
async function waitForBackend(): Promise<void> {
  const client = new BeabeeClient({
    path: env.apiUrl,
    host: env.appUrl,
  });

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

// Wait for backend before initializing the app
waitForBackend().then(() => {
  const app = createApp(App);
  initErrorHandler(app);

  app.use({ ...router });
  app.use(i18n);
  app.use(icons);

  app.mount('#app');
});
