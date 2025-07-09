<!--
  # ItemStatusText
  A comprehensive status display component showing item status with contextual time information.
  Displays different messages based on status and timing.

  Uses internal i18n for all text content:
  - Status text: via ItemStatus component (common.status.*)
  - Scheduled items: item.status.startsIn
  - Open items: item.status.endsIn
  - Ended items: common.timeAgo
-->
<template>
  <div class="flex" :class="inline ? 'gap-2' : 'flex-col'">
    <ItemStatusComponent :status="status" :circle="circle" />
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
 *   :starts="new Date('2024-01-01')"
 *   :circle="true"
 * />
 */
import { ItemStatus } from '@beabee/beabee-common';

import { formatDistanceLocale } from '@utils/dates';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import ItemStatusComponent from './ItemStatus.vue';

const { t } = useI18n();

/**
 * Props for the ItemStatusText component
 */
export interface ItemStatusTextProps {
  /** Current status of the item */
  status: ItemStatus;
  /** Start date of the item (for scheduled items) */
  starts?: Date | null;
  /** Expiration date of the item (for open/ended items) */
  expires?: Date | null;
  /** Whether to show a colored circle indicator */
  circle?: boolean;
  /** Whether to display inline (horizontal) layout */
  inline?: boolean;
}

const props = withDefaults(defineProps<ItemStatusTextProps>(), {
  starts: null,
  expires: null,
  circle: false,
  inline: false,
});

/**
 * Computed text for scheduled items showing start time
 */
const scheduledText = computed(() => {
  if (props.status !== ItemStatus.Scheduled || !props.starts) return '';

  const duration = formatDistanceLocale(props.starts, new Date());
  return t('item.status.startsIn', { duration });
});

/**
 * Computed text for open items showing end time
 */
const openText = computed(() => {
  if (props.status !== ItemStatus.Open || !props.expires) return '';

  const duration = formatDistanceLocale(props.expires, new Date());
  return t('item.status.endsIn', { duration });
});

/**
 * Computed text for ended items showing time since end
 */
const endedText = computed(() => {
  if (props.status !== ItemStatus.Ended || !props.expires) return '';

  const time = formatDistanceLocale(props.expires, new Date());
  return t('common.timeAgo', { time });
});
</script>
