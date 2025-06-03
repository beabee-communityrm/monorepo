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

/**
 * Wait for backend to be healthy before starting the app
 */
async function waitForBackend(): Promise<void> {
  const client = new BeabeeClient({
    host: import.meta.env.VITE_API_HOST || '',
    path: '/api/1.0',
  });

  const maxRetries = 30; // 30 seconds total
  const retryDelay = 1000; // 1 second between retries
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const health = await client.health.check();
      if (health.status === 'ok') {
        console.log('Backend is healthy');
        return;
      }
      console.warn('Backend returned unhealthy status:', health);
    } catch (error) {
      console.warn(
        `Backend health check failed (attempt ${retries + 1}/${maxRetries}):`,
        error
      );
    }

    retries++;
    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  console.error('Backend failed to become healthy after maximum retries');
  // Continue anyway - the app will show errors when trying to use API
}

// Wait for backend before initializing the app
waitForBackend()
  .then(() => {
    const app = createApp(App);
    initErrorHandler(app);

    app.use({ ...router });
    app.use(i18n);
    app.use(icons);

    app.mount('#app');
  })
  .catch((error) => {
    console.error('Failed to initialize app:', error);
  });
