<!--
  # AppAsyncButton
  An asynchronous button component that extends AppButton with built-in async operation handling.
  Automatically manages loading states and error notifications for async operations.
-->
<template>
  <AppButton
    :loading="loading"
    :disabled="loading"
    :aria-busy="loading"
    :aria-label="ariaLabel"
    :title="title"
    @click="handleClick"
  >
    <span v-if="loading" class="sr-only">{{ loadingText }}</span>
    <span v-else>
      <slot />
    </span>
  </AppButton>
</template>

<script lang="ts" setup>
/**
 * Asynchronous button component that handles loading states and error notifications.
 * Extends AppButton with automatic async operation support including loading states and error handling.
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

import type { AppAsyncButtonProps } from '../../types/button';
import AppButton from './AppButton.vue';

// Props interface is now imported from types
export type { AppAsyncButtonProps } from '../../types/button';

/**
 * Slots available in the AppAsyncButton component
 */
defineSlots<{
  /**
   * Default slot for button content
   * @description The text or content to display inside the button when not loading
   */
  default(): any;
}>();

const props = withDefaults(defineProps<AppAsyncButtonProps>(), {
  onClick: undefined,
  ariaLabel: undefined,
  title: undefined,
  loadingText: undefined,
  errorMessage: 'Something went wrong',
  errorDescription: undefined,
  removeAriaLabel: 'Close notification',
});

const loading = ref(false);

/**
 * Handles button click events and manages async operations
 * Automatically sets loading state and handles errors with notifications
 */
async function handleClick(evt: Event) {
  if (loading.value) return;

  loading.value = true;
  try {
    await props.onClick?.(evt);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_: unknown) {
    addNotification({
      title: props.errorMessage,
      variant: 'error',
      // Add more descriptive error message for screen readers
      description: props.errorDescription,
      removeAriaLabel: props.removeAriaLabel,
    });
  } finally {
    loading.value = false;
  }
}
</script>
