<!--
  # AppButtonGroup  
  A container for grouping multiple AppButton components with connected styling.
  Creates a cohesive button group or toolbar appearance.
-->
<template>
  <div
    class="group/btns flex pl-px"
    role="group"
    :aria-label="ariaLabel"
    :aria-description="ariaDescription"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
/**
 * Button group component that groups related buttons together with connected styling.
 * Removes spacing between buttons and rounds only outer corners for a unified appearance.
 *
 * @component AppButtonGroup
 *
 * @example
 * <AppButtonGroup aria-label="View options">
 *   <AppButton variant="primaryOutlined">List</AppButton>
 *   <AppButton variant="primaryOutlined">Grid</AppButton>
 * </AppButtonGroup>
 */

/**
 * Props for the AppButtonGroup component
 */
export interface AppButtonGroupProps {
  /** Accessible label for the button group */
  ariaLabel?: string;
  /** Additional description for screen readers */
  ariaDescription?: string;
}

/**
 * Slots available in the AppButtonGroup component
 */
defineSlots<{
  /**
   * Default slot for AppButton components
   * @description Place AppButton components here to create a connected button group
   */
  default(): any;
}>();

withDefaults(defineProps<AppButtonGroupProps>(), {
  ariaLabel: 'Button group',
  ariaDescription: undefined,
});
</script>

<style scoped>
/* Ensure focus outline is visible for keyboard navigation */
.group\/btns:focus-within {
  outline: 2px solid transparent;
  outline-offset: 2px;
}
</style>
