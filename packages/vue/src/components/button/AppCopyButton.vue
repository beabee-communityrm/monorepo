<!--
  # AppCopyButton
  A button component for copying text to the clipboard with success/error notifications.
  Shows copy icon and provides user feedback through notification system.
-->
<template>
  <button
    :title="label || t('actions.copy')"
    class="flex items-center justify-center"
    :class="{
      'h-9 w-9 rounded bg-white/70 enabled:hover:bg-white':
        props.variant === 'float',
      'h-full w-10 bg-white enabled:hover:bg-grey-lighter':
        props.variant === 'normal' && !label,
      'h-full bg-white px-3 enabled:hover:bg-grey-lighter':
        props.variant === 'normal' && label,
      'cursor-not-allowed opacity-60': props.disabled,
    }"
    :disabled="props.disabled"
    @click="handleCopy"
  >
    <font-awesome-icon
      :icon="faCopy"
      class="h-4 w-4"
      :class="{ 'mr-2': label }"
    />
    <span v-if="label" class="text-sm">{{ label }}</span>
  </button>
</template>

<script lang="ts" setup>
/**
 * Button component for copying text to the clipboard with user feedback.
 * Shows success notification when copying succeeds and error notification when it fails.
 *
 * @component AppCopyButton
 *
 * @example
 * <AppCopyButton text="Copy this text" @copy="handleCopy" />
 * <AppCopyButton text="Copy this text" label="Copy link" @copy="handleCopy" />
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
  /** Visual variant affecting button styling */
  variant?: 'normal' | 'float';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Optional text label to show next to the icon */
  label?: string;
}

/**
 * Events emitted by the AppCopyButton component
 */
const emit = defineEmits<{
  /**
   * Emitted when text is successfully copied to clipboard
   */
  copy: [];
}>();

const props = withDefaults(defineProps<AppCopyButtonProps>(), {
  variant: 'normal',
  disabled: false,
  label: undefined,
});

const { t } = useI18n();

/**
 * Handles the copy action by writing text to clipboard and showing notifications
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
