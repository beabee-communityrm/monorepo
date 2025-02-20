<template>
  <p class="mt-1.5 text-xs font-semibold text-danger" role="alert">
    {{ message }}
  </p>
</template>
<script lang="ts" setup>
import { type Ref } from 'vue';

/**
 * Props for the AppInputError component
 */
export interface AppInputErrorProps {
  /** The message to display */
  message: string | Ref<string>;
}

defineProps<AppInputErrorProps>();
</script>
