<!--
  # ItemStatusText
  A comprehensive status display component showing item status with contextual time information.
  Displays different messages based on status and timing.
-->
<template>
  <div class="flex" :class="inline ? 'gap-2' : 'flex-col'">
    <ItemStatusComponent
      :status="status"
      :status-text="statusText"
      :circle="circle"
    />
    <span v-if="status === ItemStatus.Scheduled && starts && scheduledText">
      {{ scheduledText }}
    </span>
    <span v-else-if="status === ItemStatus.Open && expires && openText">
      {{ openText }}
    </span>
    <span v-else-if="status === ItemStatus.Ended && expires && endedText">
      {{ endedText }}
    </span>
  </div>
</template>

<script lang="ts" setup>
/**
 * Advanced status display component showing status with dynamic time-based messages.
 * Provides contextual information about when items start, end, or expired.
 *
 * @component ItemStatusText
 *
 * @example
 * <ItemStatusText
 *   :status="ItemStatus.Scheduled"
 *   status-text="Scheduled"
 *   :starts="new Date('2024-01-01')"
 *   scheduled-text="Starts in 2 days"
 *   :circle="true"
 * />
 */
import { ItemStatus } from '@beabee/beabee-common';

import ItemStatusComponent from './ItemStatus.vue';

/**
 * Props for the ItemStatusText component
 */
export interface ItemStatusTextProps {
  /** Current status of the item */
  status: ItemStatus;
  /** Translated status text to display */
  statusText: string;
  /** Start date of the item (for scheduled items) */
  starts?: Date | null;
  /** Expiration date of the item (for open/ended items) */
  expires?: Date | null;
  /** Whether to show a colored circle indicator */
  circle?: boolean;
  /** Whether to display inline (horizontal) layout */
  inline?: boolean;
  /** Translated text for scheduled items (e.g., "Starts in 2 days") */
  scheduledText?: string;
  /** Translated text for open items (e.g., "Ends in 5 hours") */
  openText?: string;
  /** Translated text for ended items (e.g., "Ended 1 week ago") */
  endedText?: string;
}

const props = withDefaults(defineProps<ItemStatusTextProps>(), {
  starts: null,
  expires: null,
  circle: false,
  inline: false,
  scheduledText: '',
  openText: '',
  endedText: '',
});
</script>
