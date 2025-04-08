<template>
  <label class="mb-0.5 block font-semibold">
    {{ label }} {{ required ? '*' : '' }}
  </label>
</template>
<script lang="ts" setup>
/**
 * Props for the AppLabel component
 */
export interface AppLabelProps {
  /** The label to display */
  label: string;
  /** Whether the label is required */
  required?: boolean;
}

defineProps<AppLabelProps>();
</script>
