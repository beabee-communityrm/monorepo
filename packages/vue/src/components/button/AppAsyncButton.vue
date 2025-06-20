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
import { useI18n } from 'vue-i18n';

import AppButton from './AppButton.vue';

/**
 * Props for the AppAsyncButton component
 */
export interface AppAsyncButtonProps {
  /** Async function to execute when the button is clicked */
  onClick?: (evt: Event) => Promise<void>;
  /** Accessible label for the button */
  ariaLabel?: string;
  /** Tooltip text displayed on hover */
  title?: string;
  /** Text announced to screen readers during loading state */
  loadingText?: string;
}

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
});

const { t } = useI18n();
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
