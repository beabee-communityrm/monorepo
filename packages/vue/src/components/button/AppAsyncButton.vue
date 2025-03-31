<template>
  <AppButton :loading="loading" v-bind="$attrs" @click="handleClick">
    <slot />
  </AppButton>
</template>
<script lang="ts" setup>
/**
 * A button component that handles asynchronous operations with loading state.
 * Automatically shows an error notification if the async operation fails.
 */
import { ref } from 'vue';
import AppButton from './AppButton.vue';
import { addNotification } from '@beabee/vue/store/notifications';
import { useI18n } from 'vue-i18n';

// Define the component props interface
export interface AppAsyncButtonProps {
  /**
   * Async function to execute when the button is clicked
   * If not provided, the button will just show loading state during click
   */
  onClick?: (evt: Event) => Promise<void>;
}

const props = defineProps<AppAsyncButtonProps>();

const { t } = useI18n();

const loading = ref(false);

async function handleClick(evt: Event) {
  loading.value = true;
  try {
    await props.onClick?.(evt);
  } catch {
    addNotification({
      title: t('form.errorMessages.generic'),
      variant: 'error',
    });
  } finally {
    loading.value = false;
  }
}
</script>
