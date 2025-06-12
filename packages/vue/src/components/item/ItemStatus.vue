<!--
  # ItemStatus  
  A component for displaying item status with color-coded styling and optional circle indicator.
  Shows status text in various predefined color schemes.
-->
<template>
  <span class="text-sm font-bold uppercase" :class="colorClasses[status]">
    <span
      v-if="circle"
      class="-mt-px mr-1 inline-block h-3 w-3 rounded-full bg-[currentColor] align-middle"
      :aria-hidden="true"
    />
    {{ statusText }}
  </span>
</template>

<script lang="ts" setup>
/**
 * Status display component with color-coded styling for different item states.
 * Supports optional circle indicator and customizable status text.
 *
 * @component ItemStatus
 *
 * @example
 * <ItemStatus status="open" status-text="Active" :circle="true" />
 */
import { ItemStatus } from '@beabee/beabee-common';

/**
 * Props for the ItemStatus component
 */
export interface ItemStatusProps {
  /** Current status of the item */
  status: ItemStatus;
  /** Translated status text to display */
  statusText: string;
  /** Whether to show a colored circle indicator before the text */
  circle?: boolean;
}

const props = withDefaults(defineProps<ItemStatusProps>(), {
  circle: false,
});

/**
 * Color classes for different item statuses
 */
const colorClasses = {
  [ItemStatus.Draft]: 'text-body-60',
  [ItemStatus.Scheduled]: 'text-warning',
  [ItemStatus.Open]: 'text-success',
  [ItemStatus.Ended]: 'text-body-80',
} as const;
</script>
