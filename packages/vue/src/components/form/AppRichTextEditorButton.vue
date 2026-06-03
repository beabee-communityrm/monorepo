<!--
  # AppRichTextEditorButton
  A button component for rich text editor toolbars. Used as a toolbar button
  that can be active/inactive and provides visual feedback for editing states.

  ## Features:
  - Active/inactive visual states
  - Disabled state support
  - Iconify icon support
  - Keyboard navigation
  - ARIA labels for accessibility
  - Touch-friendly 44x44px minimum target size
-->
<template>
  <AppButton
    type="button"
    :color="'primary'"
    :variant="active ? 'solid' : 'outline'"
    size="sm"
    :disabled="disabled"
    :icon="icon"
    :aria-label="title"
    :aria-pressed="active"
    :title="title"
    @click="$emit('click', $event)"
  />
</template>

<script lang="ts" setup>
/**
 * Rich text editor toolbar button component.
 * Provides an accessible button for rich text editing commands.
 *
 * @component AppRichTextEditorButton
 */
import { AppButton } from '../index';

/**
 * Props for the AppRichTextEditorButton component
 */
export interface AppRichTextEditorButtonProps {
  /** Whether the button is in active state (command is applied) */
  active: boolean;
  /** Whether the button is disabled */
  disabled: boolean;
  /** Iconify icon string, e.g. "fa6-solid:bold" */
  icon: string;
  /** Accessible title/tooltip text for the button */
  title: string;
}

defineProps<AppRichTextEditorButtonProps>();

/**
 * Events emitted by the AppRichTextEditorButton component
 */
defineEmits<{
  click: [event: Event];
}>();
</script>
