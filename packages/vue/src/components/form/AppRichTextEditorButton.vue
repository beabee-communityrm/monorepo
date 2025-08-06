<!--
  # AppRichTextEditorButton
  A button component for rich text editor toolbars. Used as a toolbar button 
  that can be active/inactive and provides visual feedback for editing states.

  ## Features:
  - Active/inactive visual states
  - Disabled state support
  - FontAwesome icon support
  - Keyboard navigation
  - ARIA labels for accessibility
  - Touch-friendly 44x44px minimum target size
-->
<template>
  <AppButton
    type="button"
    :variant="active ? 'primary' : 'primaryOutlined'"
    size="sm"
    :disabled="disabled"
    :aria-label="title"
    :aria-pressed="active"
    :title="title"
    @click="$emit('click', $event)"
  >
    <font-awesome-icon
      v-if="icon"
      :icon="icon"
      class="h-4 w-4"
      aria-hidden="true"
    />
  </AppButton>
</template>

<script lang="ts" setup>
/**
 * Rich text editor toolbar button component.
 * Provides an accessible button for rich text editing commands.
 *
 * @component AppRichTextEditorButton
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import { AppButton } from '../index';

/**
 * Props for the AppRichTextEditorButton component
 */
export interface AppRichTextEditorButtonProps {
  /** Whether the button is in active state (command is applied) */
  active: boolean;
  /** Whether the button is disabled */
  disabled: boolean;
  /** FontAwesome icon to display */
  icon: IconDefinition;
  /** Accessible title/tooltip text for the button */
  title: string;
}

defineProps<AppRichTextEditorButtonProps>();

/**
 * Events emitted by the AppRichTextEditorButton component
 */
defineEmits<{
  /**
   * Emitted when the button is clicked
   * @param event - The click event
   */
  click: [event: Event];
}>();
</script>
