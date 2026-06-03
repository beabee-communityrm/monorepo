<!--
  # ActionButton
  A specialized button component that extends AppButton with primaryOutlined variant.
  Used primarily for action items in navigation menus, toolbars, or action panels.
-->
<template>
  <AppButton
    color="primary"
    variant="outline"
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
 * <ActionButton icon="fa6-solid:pen-to-square">
 *   Edit Item
 * </ActionButton>
 */
import AppButton from './AppButton.vue';

/**
 * Props for the ActionButton component
 */
export interface ActionButtonProps {
  /** Iconify icon string, e.g. "fa6-solid:pencil" */
  icon: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Tooltip text displayed on hover */
  title?: string;
}

withDefaults(defineProps<ActionButtonProps>(), {
  ariaLabel: undefined,
  title: undefined,
});
</script>
