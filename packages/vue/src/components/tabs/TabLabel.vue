<template>
  <span class="flex items-center">
    {{ label }}
    <span v-if="count !== undefined" class="ml-1">({{ count }})</span>
    <font-awesome-icon
      v-if="error"
      :icon="faExclamationCircle"
      class="ml-2 text-danger"
      aria-label="Error"
    />
    <font-awesome-icon
      v-else-if="validated"
      :icon="faCheckCircle"
      class="ml-2 text-success"
      aria-label="Validated"
    />
  </span>
</template>

<script lang="ts" setup>
import {
  faExclamationCircle,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons';
/**
 * Props for the TabLabel component
 */
export interface TabLabelProps {
  /** Label text to display */
  label: string;
  /** Optional count to display next to label */
  count?: number;
  /** Indicates if the tab content has validation errors */
  error?: boolean;
  /** Indicates if the tab content has been successfully validated */
  validated?: boolean;
}

defineProps<TabLabelProps>();
</script>
