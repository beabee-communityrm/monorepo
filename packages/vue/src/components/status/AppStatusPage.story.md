# AppStatusPage

The `AppStatusPage` component provides a full-screen status display for application loading states. It's designed to be shown during application startup while waiting for backend services to become available.

## Features

- Full-screen loading interface with centered content
- Animated loading indicators and progress bars
- Configurable title, message, and status text
- Optional progress tracking with percentage display
- Retry functionality for failed connections
- Responsive design that works on all screen sizes
- Consistent styling with the application theme

## Usage

```vue
<AppStatusPage
  title="Loading Application"
  message="Please wait while we connect to the server..."
  loading-text="Performing health checks"
  :show-progress="true"
  :progress="45"
  progress-text="Verifying database connectivity..."
/>
```

## Props

| Prop           | Type      | Default                                    | Description                                |
| -------------- | --------- | ------------------------------------------ | ------------------------------------------ |
| `title`        | `string`  | `'Loading Application'`                    | Main title displayed on the status page    |
| `message`      | `string`  | `'Please wait while we prepare...'`        | Status message explaining what's happening |
| `loadingText`  | `string`  | `'Connecting to server'`                   | Text displayed next to the loading spinner |
| `showProgress` | `boolean` | `false`                                    | Whether to show the progress bar           |
| `progress`     | `number`  | `0`                                        | Progress percentage (0-100)                |
| `progressText` | `string`  | `'Initializing...'`                        | Text displayed below the progress bar      |
| `showRetry`    | `boolean` | `false`                                    | Whether to show the retry button           |
| `retryText`    | `string`  | `'Try Again'`                              | Text for the retry button                  |
| `showInfo`     | `boolean` | `false`                                    | Whether to show additional info            |
| `infoText`     | `string`  | `'This usually takes just a few seconds.'` | Additional information text                |

## Events

| Event   | Description                              |
| ------- | ---------------------------------------- |
| `retry` | Emitted when the retry button is clicked |

## Examples

### Basic Loading State

```vue
<AppStatusPage
  title="Starting Application"
  message="Please wait while we initialize the system..."
/>
```

### With Progress Tracking

```vue
<AppStatusPage
  title="Loading Services"
  message="Setting up your environment..."
  :show-progress="true"
  :progress="65"
  progress-text="Loading configuration files..."
/>
```

### With Retry Option

```vue
<AppStatusPage
  title="Connection Issues"
  message="We're having trouble connecting to the server."
  :show-retry="true"
  :show-info="true"
  info-text="Check your internet connection and try again."
  @retry="handleRetry"
/>
```

### Health Check Example

Perfect for the backend health check scenario:

```vue
<AppStatusPage
  title="Health Check"
  message="Verifying server status before launching..."
  loading-text="Checking backend services"
  :show-progress="true"
  :progress="healthCheckProgress"
  progress-text="Database connectivity verified"
  :show-info="true"
  info-text="Ensuring optimal performance for your session."
/>
```

## Integration with Main.ts

The component is designed to be used in `main.ts` during the `waitForBackend()` process:

```vue
<script setup>
import AppStatusPage from '@beabee/vue/components/status/AppStatusPage.vue';

import { ref } from 'vue';

const showStatus = ref(true);
const healthProgress = ref(0);

// Show status page while waiting for backend
if (showStatus.value) {
  // Mount status page temporarily
  // ... wait for backend logic
}
</script>

<template>
  <AppStatusPage
    v-if="showStatus"
    title="Starting Beabee"
    message="Please wait while we connect to our services..."
    loading-text="Performing health checks"
    :show-progress="true"
    :progress="healthProgress"
    progress-text="Verifying backend connectivity..."
  />
  <div v-else>
    <!-- Main application content -->
  </div>
</template>
```

## Design Features

- **Centered Layout**: Full-screen centered design that works on all devices
- **Animated Icons**: Heart icon with pulse animation and spinning loader
- **Progress Visualization**: Smooth animated progress bar with percentage tracking
- **Accessibility**: Proper semantic HTML and ARIA labels
- **Theme Integration**: Uses application color scheme and typography
- **Responsive**: Adapts to different screen sizes with appropriate padding

## Real-world Use Cases

1. **Application Startup**: Show while the main application loads
2. **Health Checks**: Display during backend connectivity verification
3. **Service Initialization**: Track progress of multiple service startups
4. **Connection Recovery**: Provide retry options when connections fail
5. **Maintenance Mode**: Inform users during system maintenance

The AppStatusPage provides a professional and user-friendly loading experience that keeps users informed about what's happening during application startup.
