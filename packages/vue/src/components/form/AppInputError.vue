<template>
  <p
    :id="id"
    class="mt-1.5 text-xs font-semibold text-danger"
    role="alert"
    aria-live="polite"
  >
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
  /** The ID for the error element */
  id?: string;
}

defineProps<AppInputErrorProps>();
</script>
