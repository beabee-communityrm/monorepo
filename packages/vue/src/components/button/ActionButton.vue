<!--
  # ActionButton
  A specialized button component that extends AppButton with primaryOutlined variant.
  Used primarily for action items in navigation menus, toolbars, or action panels.
-->
<template>
  <AppButton
    variant="primaryOutlined"
    class="lg:justify-start"
    :icon="icon"
    :aria-label="ariaLabel || title"
    :title="title"
  >
    <span v-if="ariaLabel && !$slots.default" class="sr-only">{{
      ariaLabel
    }}</span>
    <slot></slot>
  </AppButton>
</template>

<script lang="ts" setup>
/**
 * Action button component that extends AppButton with predefined styling.
 * Always uses the primaryOutlined variant and requires an icon.
 *
 * @component ActionButton
 *
 * @example
 * <ActionButton :icon="faEdit">
 *   Edit Item
 * </ActionButton>
 */
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

import AppButton from './AppButton.vue';

/**
 * Props for the ActionButton component
 */
export interface ActionButtonProps {
  /** FontAwesome icon to display in the button (required) */
  icon: IconDefinition;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Tooltip text displayed on hover */
  title?: string;
}

/**
 * Slots available in the ActionButton component
 */
defineSlots<{
  /**
   * Default slot for button content
   * @description The text or content to display inside the button
   */
  default(): any;
}>();

withDefaults(defineProps<ActionButtonProps>(), {
  ariaLabel: undefined,
  title: undefined,
});
</script>
