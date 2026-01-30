<!--
  # AppAsyncButton
  A button component that handles async operations with loading states.

  ## Features
  - Automatic loading state during async operations
  - Error handling with notifications
  - Customizable styling and sizing
  - Icon support
  - Accessibility features

  ## Props
  - Standard button props (variant, size, icon, etc.)

  ## Events
  - `click`: Emitted when button is clicked (returns Promise for async operations)
-->
<template>
  <AppButton
    :loading="loading"
    :disabled="loading || props.disabled"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    :title="title"
    @click="handleClick"
  >
    <span v-if="loading" class="sr-only">{{ t('common.loading') }}</span>
    <span :class="{ invisible: loading }">
      <slot />
    </span>
  </AppButton>
</template>

<script lang="ts" setup>
/**
 * Asynchronous button component that handles loading states and error notifications.
 * Extends AppButton with automatic async operation support.
 *
 * @component AppAsyncButton
 *
 * @example
 * <AppAsyncButton :onClick="async () => await saveData()">
 *   Save Changes
 * </AppAsyncButton>
 */
import { addNotification } from '@beabee/vue/store/notifications';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppButton, { type AppButtonProps } from './AppButton.vue';

const { t } = useI18n();

/**
 * Props for the AppAsyncButton component
 */
export interface AppAsyncButtonProps extends AppButtonProps {
  /** Async function to execute when the button is clicked */
  onClick?: (evt: Event) => Promise<void>;
  /** Accessible label for the button */
  ariaLabel?: string;
  /** Tooltip text displayed on hover */
  title?: string;
}

const props = withDefaults(defineProps<AppAsyncButtonProps>(), {
  onClick: undefined,
  ariaLabel: undefined,
  title: undefined,
});

const loading = ref(false);

/**
 * Handles button click events and manages async operations
 * Automatically sets loading state and handles errors with notifications
 */
async function handleClick(evt: Event) {
  if (loading.value || props.disabled) return;

  loading.value = true;
  try {
    await props.onClick?.(evt);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_: unknown) {
    addNotification({
      title: t('form.errorMessages.generic'),
      variant: 'error',
      // Add more descriptive error message for screen readers
      description: t('form.errorMessages.asyncActionFailed'),
    });
  } finally {
    loading.value = false;
  }
}
</script>
