<template>
  <div
    class="flex min-h-screen items-center justify-center bg-grey-lighter p-4"
  >
    <div class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
      <!-- Logo/Icon -->
      <div class="mb-6">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-10"
        >
          <font-awesome-icon
            :icon="faHeart"
            class="h-8 w-8 animate-pulse text-primary"
          />
        </div>
      </div>

      <!-- Title -->
      <h1 class="mb-4 text-2xl font-bold text-body">
        {{ title }}
      </h1>

      <!-- Status Message -->
      <p class="mb-6 text-body-80">
        {{ message }}
      </p>

      <!-- Loading Indicator -->
      <div class="mb-6 flex items-center justify-center">
        <font-awesome-icon
          :icon="faCircleNotch"
          class="h-6 w-6 animate-spin text-primary"
          spin
        />
        <span class="ml-3 text-sm text-body-60">
          {{ loadingText }}
        </span>
      </div>

      <!-- Progress Indicator -->
      <div v-if="showProgress" class="mb-6">
        <div class="h-2 w-full overflow-hidden rounded-full bg-grey-light">
          <div
            class="h-full bg-primary transition-all duration-1000 ease-out"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <p class="mt-2 text-xs text-body-60">
          {{ progressText }}
        </p>
      </div>

      <!-- Retry Button -->
      <div v-if="showRetry" class="mb-4">
        <AppButton variant="primaryOutlined" size="sm" @click="handleRetry">
          {{ retryText }}
        </AppButton>
      </div>

      <!-- Additional Info -->
      <div v-if="showInfo" class="text-xs text-body-60">
        <p>{{ infoText }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * A status page component that displays loading state while waiting for backend readiness.
 * Used during application startup to provide user feedback during health checks.
 *
 * @component AppStatusPage
 *
 * @example
 * <AppStatusPage
 *   title="Starting Application"
 *   message="Please wait while we connect to the server..."
 *   :progress="45"
 *   show-progress
 * />
 */
import { faCircleNotch, faHeart } from '@fortawesome/free-solid-svg-icons';

import { AppButton } from '../button';

/**
 * Props for the AppStatusPage component
 */
export interface AppStatusPageProps {
  /** Main title displayed on the status page */
  title?: string;
  /** Status message explaining what's happening */
  message?: string;
  /** Loading text displayed next to the spinner */
  loadingText?: string;
  /** Whether to show the progress bar */
  showProgress?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Text displayed below the progress bar */
  progressText?: string;
  /** Whether to show the retry button */
  showRetry?: boolean;
  /** Text for the retry button */
  retryText?: string;
  /** Whether to show additional info */
  showInfo?: boolean;
  /** Additional information text */
  infoText?: string;
}

const props = withDefaults(defineProps<AppStatusPageProps>(), {
  title: 'Loading Application',
  message: 'Please wait while we prepare everything for you...',
  loadingText: 'Connecting to server',
  showProgress: false,
  progress: 0,
  progressText: 'Initializing...',
  showRetry: false,
  retryText: 'Try Again',
  showInfo: false,
  infoText: 'This usually takes just a few seconds.',
});

const emit = defineEmits<{
  /** Emitted when the retry button is clicked */
  (e: 'retry'): void;
}>();

/**
 * Handles retry button click
 */
function handleRetry() {
  emit('retry');
}
</script>
