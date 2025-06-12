import { AppStatusPage } from '@beabee/vue/components';
import { icons } from '@beabee/vue/plugins/icons';

import { waitForBackend } from '@utils/api/client';
import { type App as VueApp, createApp, h } from 'vue';

import App from '../App.vue';
import { init as initErrorHandler } from './appsignal';
import { i18n } from './i18n';
import router from './router';

// Flag to prevent multiple app initializations
let isAppInitialized = false;
let statusApp: VueApp<Element> | null = null;

/**
 * Start the main application after backend is ready
 */
export async function startMainApp() {
  if (isAppInitialized) {
    return;
  }

  isAppInitialized = true;

  // Unmount status app if it exists
  if (statusApp) {
    statusApp.unmount();
  }

  const app = createApp(App);
  initErrorHandler(app);

  app.use({ ...router });
  app.use(i18n);
  app.use(icons);

  app.mount('#app');
}

/**
 * Show the status page while waiting for backend
 */
function showStatusPage() {
  if (isAppInitialized) {
    return;
  }

  // Create a temporary app for the status page
  statusApp = createApp({
    data() {
      return {
        showRetry: false,
      };
    },
    async mounted() {
      await this.checkBackend();
    },
    methods: {
      async handleRetry() {
        this.showRetry = false;
        await this.checkBackend();
      },
      async checkBackend() {
        if (isAppInitialized) {
          return;
        }

        try {
          // Wait for backend without progress tracking
          await waitForBackend();
          await startMainApp();
        } catch {
          // Show retry button on failure
          this.showRetry = true;
        }
      },
    },
    render() {
      return h(AppStatusPage, {
        title: 'Starting Beabee',
        message: 'Please wait while we connect to our services...',
        loadingText: 'Performing health checks',
        showProgress: false,
        showRetry: this.showRetry,
        retryText: 'Try Again',
        showInfo: !this.showRetry,
        infoText: 'This usually takes just a few seconds.',
        onRetry: this.handleRetry,
      });
    },
  });

  // Mount the status app
  statusApp.use(icons);
  statusApp.mount('#app');
}

/**
 * Initialize the application with race condition between backend response and timeout
 */
export async function initializeApp() {
  // Create a promise that resolves after a delay (to show status page)
  const delayPromise = new Promise<'show-status'>((resolve) => {
    setTimeout(() => resolve('show-status'), 500);
  });

  // Create a promise that tries to connect to backend quickly
  const backendPromise = new Promise<'backend-ready'>((resolve, reject) => {
    waitForBackend(1) // Only try once for the quick check
      .then(() => resolve('backend-ready'))
      .catch(() => reject());
  });

  try {
    // Race between backend response and delay
    const result = await Promise.race([delayPromise, backendPromise]);

    if (result === 'backend-ready') {
      // Backend responded quickly, start app directly
      await startMainApp();
    } else {
      // Timeout reached, show status page
      showStatusPage();
    }
  } catch {
    // Backend check failed quickly, show status page
    showStatusPage();
  }
}
