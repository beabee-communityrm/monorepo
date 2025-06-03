# Status Components

This directory contains components for displaying application status and loading states.

## AppStatusPage

A full-screen status page component designed for application startup and health check scenarios.

## Integration Example for Frontend

Here's how you can integrate the `AppStatusPage` with the existing `waitForBackend` logic in `apps/frontend/src/main.ts`:

```typescript
import { createApp, ref } from 'vue';
import { AppStatusPage } from '@beabee/vue/components/status';
import App from './App.vue';

// Status tracking
const showStatusPage = ref(true);
const statusProgress = ref(0);
const statusText = ref('Checking server connectivity...');

// Create a temporary status app
const statusApp = createApp(AppStatusPage, {
  title: 'Starting Beabee',
  message: 'Please wait while we connect to our services...',
  loadingText: statusText.value,
  showProgress: true,
  progress: statusProgress.value,
  progressText: statusText.value,
  showInfo: true,
  infoText: 'This usually takes just a few seconds.',
});

// Mount status page
const statusElement = document.createElement('div');
statusElement.id = 'status-page';
document.body.appendChild(statusElement);
statusApp.mount(statusElement);

// Enhanced waitForBackend with progress updates
async function waitForBackendWithProgress() {
  const maxRetries = 60;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      statusProgress.value = Math.min((retries / maxRetries) * 90, 90);
      statusText.value = `Attempt ${retries + 1}/${maxRetries}...`;

      // Your existing health check logic here
      const response = await fetch('/health');
      if (response.ok) {
        statusProgress.value = 100;
        statusText.value = 'Connection established!';
        await new Promise((resolve) => setTimeout(resolve, 500)); // Brief success display
        break;
      }
    } catch (error) {
      console.log(`Health check attempt ${retries + 1} failed:`, error);
    }

    retries++;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Clean up status page
  statusApp.unmount();
  document.body.removeChild(statusElement);
  showStatusPage.value = false;
}

// Start the enhanced backend wait
waitForBackendWithProgress().then(() => {
  // Initialize main app
  const app = createApp(App);
  // ... rest of your app initialization
  app.mount('#app');
});
```

## Alternative: Reactive Integration

For a more reactive approach:

```typescript
import { createApp, ref, watch } from 'vue';
import { AppStatusPage } from '@beabee/vue/components/status';

const healthStatus = ref({
  isReady: false,
  progress: 0,
  message: 'Initializing...',
  error: null as string | null,
});

// Create status page with reactive props
const StatusPage = {
  setup() {
    return {
      ...healthStatus.value,
      onRetry: () => {
        healthStatus.value.error = null;
        healthStatus.value.progress = 0;
        startHealthCheck();
      },
    };
  },
  components: { AppStatusPage },
  template: `
    <AppStatusPage
      title="Starting Beabee"
      :message="error || 'Please wait while we connect to our services...'"
      loading-text="Performing health checks"
      :show-progress="true"
      :progress="progress"
      progress-text="Verifying backend connectivity..."
      :show-retry="!!error"
      :show-info="true"
      info-text="If this takes longer than expected, try refreshing the page."
      @retry="onRetry"
    />
  `,
};

async function startHealthCheck() {
  // Your health check logic with progress updates
  // Update healthStatus.value.progress and healthStatus.value.message
}
```

This provides a smooth user experience during the application startup process.
