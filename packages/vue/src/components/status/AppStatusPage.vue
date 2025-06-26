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
        {{ t('status.loadingApplication') }}
      </h1>

      <!-- Status Message -->
      <p class="mb-6 text-body-80">
        {{ t('status.pleaseWait') }}
      </p>

      <!-- Loading Indicator -->
      <div class="mb-6 flex items-center justify-center">
        <font-awesome-icon
          :icon="faCircleNotch"
          class="h-6 w-6 animate-spin text-primary"
          spin
        />
        <span class="ml-3 text-sm text-body-60">
          {{ t('status.connectingToServer') }}
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
          {{ t('status.initializing') }}
        </p>
      </div>

      <!-- Retry Button -->
      <div v-if="showRetry" class="mb-4">
        <AppButton variant="primaryOutlined" size="sm" @click="handleRetry">
          {{ t('actions.tryAgain') }}
        </AppButton>
      </div>

      <!-- Additional Info -->
      <div v-if="showInfo" class="text-xs text-body-60">
        <p>{{ t('status.usuallyTakesSeconds') }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * A status page component that displays loading state while waiting for backend readiness.
 * Used during application startup to provide user feedback during health checks.
 *
 * Uses internal i18n for all text content:
 * - status.loadingApplication
 * - status.pleaseWait
 * - status.connectingToServer
 * - status.initializing
 * - actions.tryAgain
 * - status.usuallyTakesSeconds
 *
 * @component AppStatusPage
 *
 * @example
 * <AppStatusPage
 *   :progress="45"
 *   show-progress
 *   show-retry
 *   @retry="handleRetry"
 * />
 */
import { faCircleNotch, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';

import { AppButton } from '../button';

const { t } = useI18n();

/**
 * Props for the AppStatusPage component
 */
export interface AppStatusPageProps {
  /** Whether to show the progress bar */
  showProgress?: boolean;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Whether to show the retry button */
  showRetry?: boolean;
  /** Whether to show additional info */
  showInfo?: boolean;
}

const props = withDefaults(defineProps<AppStatusPageProps>(), {
  showProgress: false,
  progress: 0,
  showRetry: false,
  showInfo: false,
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
