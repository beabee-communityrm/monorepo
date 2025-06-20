<template>
  <div
    :id="id"
    class="mt-2 flex text-xs text-body-80"
    role="note"
    aria-label="Help information"
  >
    <font-awesome-icon
      class="font-primary-80 text-base"
      :icon="faInfoCircle"
      aria-hidden="true"
    />

    <span class="ml-1 font-semibold">{{ message }}</span>
  </div>
</template>

<script lang="ts" setup>
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

/**
 * Props for the AppInputHelp component
 */
export interface AppInputHelpProps {
  /** The message to display */
  message: string;
  /** The ID for the help element */
  id?: string;
}

defineProps<AppInputHelpProps>();
</script>
