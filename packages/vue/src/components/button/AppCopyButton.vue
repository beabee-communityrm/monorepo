<!--
  # AppCopyButton
  A button component for copying text to the clipboard with success/error notifications.
  Shows copy icon and provides user feedback through notification system.
-->
<template>
  <button
    :title="label || copyButtonTitle"
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
 * <AppCopyButton
 *   text="Copy this text"
 *   copy-button-title="Copy to clipboard"
 *   success-message="Copied to clipboard"
 *   error-message="Failed to copy"
 *   @copy="handleCopy"
 * />
 */
import { faCopy } from '@fortawesome/free-solid-svg-icons';

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
  /** Aria label for the remove button on notifications */
  removeAriaLabel?: string;
  /** Title text for the copy button */
  copyButtonTitle?: string;
  /** Success message to show when copy succeeds */
  successMessage?: string;
  /** Error message to show when copy fails */
  errorMessage?: string;
  /** Error description template with {error} placeholder (optional) */
  errorDescription?: string;
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
  removeAriaLabel: 'Close notification',
  copyButtonTitle: 'Copy to clipboard',
  successMessage: 'Copied to clipboard',
  errorMessage: 'Failed to copy',
  errorDescription: undefined,
});

/**
 * Handles the copy action by writing text to clipboard and showing notifications
 */
const handleCopy = async () => {
  if (props.disabled) return;

  try {
    await navigator.clipboard.writeText(props.text);
    addNotification({
      title: props.successMessage,
      variant: 'success',
      removeable: 'auto',
      removeAriaLabel: props.removeAriaLabel,
    });
    emit('copy');
  } catch (error) {
    addNotification({
      title: props.errorMessage,
      description: props.errorDescription
        ? props.errorDescription.replace('{error}', String(error))
        : undefined,
      variant: 'error',
      removeable: 'auto',
      removeAriaLabel: props.removeAriaLabel,
    });
  }
};
</script>
