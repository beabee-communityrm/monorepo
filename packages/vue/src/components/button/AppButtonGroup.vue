<template>
  <div class="group/btns flex pl-px">
    <slot />
  </div>
</template>

<script lang="ts" setup>
/**
 * A container component for grouping AppButton components together with
 * connected styling, creating a button group or toolbar.
 */

// No props needed for this component
export interface AppButtonGroupProps {}

defineProps<AppButtonGroupProps>();
</script>
