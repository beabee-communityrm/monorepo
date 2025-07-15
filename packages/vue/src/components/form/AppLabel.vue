<template>
  <label class="mb-0.5 block font-semibold" :for="htmlFor">
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
  /** The ID of the input element this label is for */
  htmlFor?: string;
}

defineProps<AppLabelProps>();
</script>
