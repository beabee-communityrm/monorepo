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
 * An asynchronous button component that handles loading states and error notifications.
 * Extends AppButton with async operation support.
 *
 * @component AppAsyncButton
 *
 * @example
 * <AppAsyncButton
 *   :onClick="async () => await saveData()"
 *   aria-label="Save changes"
 *   loading-text="Saving changes..."
 * >
 *   Save
 * </AppAsyncButton>
 */

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppButton from './AppButton.vue';
import { addNotification } from '../../store/notifications';

interface Props {
  /** Async function to execute on click */
  onClick?: (evt: Event) => Promise<void>;
  /** Accessible label for the button */
  ariaLabel?: string;
  /** Tooltip text */
  title?: string;
  /** Text to announce when loading */
  loadingText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  onClick: undefined,
  ariaLabel: undefined,
  title: undefined,
  loadingText: undefined,
});

const { t } = useI18n();
const loading = ref(false);

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
