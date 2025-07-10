<template>
  <label class="mb-0.5 block font-semibold" :for="for">
    {{ label }} {{ required ? '*' : '' }}
  </label>
</template>
<script lang="ts" setup>
import { computed } from 'vue';

/**
 * Props for the AppLabel component
 */
export interface AppLabelProps {
  /** The label to display */
  label: string;
  /** Whether the label is required */
  required?: boolean;
  /** The ID of the input element this label is for */
  for?: string;
}

defineProps<AppLabelProps>();
</script>
