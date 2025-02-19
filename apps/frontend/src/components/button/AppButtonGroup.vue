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
 * A button group component that groups related buttons together.
 * Provides visual and semantic grouping of buttons.
 *
 * @component AppButtonGroup
 *
 * @example
 * <AppButtonGroup aria-label="View options">
 *   <AppButton>List</AppButton>
 *   <AppButton>Grid</AppButton>
 * </AppButtonGroup>
 */

interface Props {
  /** Accessible label for the button group */
  ariaLabel?: string;
  /** Additional description for screen readers */
  ariaDescription?: string;
}

withDefaults(defineProps<Props>(), {
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
