<template>
  <button
    :title="t('actions.copy')"
    class="flex items-center justify-center"
    :class="{
      'h-9 w-9 rounded bg-white/70 enabled:hover:bg-white':
        props.variant === 'float',
      'h-full w-10 bg-white enabled:hover:bg-grey-lighter':
        props.variant === 'normal',
      'cursor-not-allowed opacity-60': props.disabled,
    }"
    :disabled="props.disabled"
    @click="handleCopy"
  >
    <font-awesome-icon :icon="faCopy" class="h-4 w-4" />
  </button>
</template>

<script lang="ts" setup>
/**
 * A button component for copying text to the clipboard.
 * Shows a success notification when copying is successful.
 *
 * @component AppCopyButton
 *
 * @example
 * <AppCopyButton text="Text to copy" @copy="handleCopy" />
 */
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from 'vue-i18n';

import { addNotification } from '../../store/notifications';

/**
 * Props for the AppCopyButton component
 */
export interface AppCopyButtonProps {
  /** The text to copy to clipboard */
  text: string;
  /** The button variant */
  variant?: 'normal' | 'float';
  /** Disabled state */
  disabled?: boolean;
}

const props = withDefaults(defineProps<AppCopyButtonProps>(), {
  variant: 'normal',
  disabled: false,
});

const { t } = useI18n();
const emit = defineEmits<{
  /** Emitted when text is successfully copied */
  (e: 'copy'): void;
}>();

/**
 * Handles the copy action
 * Copies the text to clipboard and shows a notification
 */
const handleCopy = async () => {
  if (props.disabled) return;

  try {
    await navigator.clipboard.writeText(props.text);
    addNotification({
      title: t('notifications.copy.success'),
      variant: 'success',
      removeable: 'auto',
    });
    emit('copy');
  } catch (error) {
    addNotification({
      title: t('notifications.copy.error'),
      description: t('notifications.copy.errorDesc', {
        error,
      }),
      variant: 'error',
      removeable: 'auto',
    });
  }
};
</script>
