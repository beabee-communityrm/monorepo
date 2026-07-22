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
    <ItemStatusComponent :status="item.status" :circle="circle" />
    <span>{{ text }}</span>
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
 * <ItemStatusText :item="item" circle />
 */
import { ItemStatus } from '@beabee/beabee-common';
import { formatDistanceLocale } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import ItemStatusComponent from './ItemStatus.vue';

const { t } = useI18n();

/**
 * Props for the ItemStatusText component
 */
export interface ItemStatusTextProps {
  item: {
    /** Current status of the item */
    status: ItemStatus;
    /** Start date of the item (for scheduled items) */
    starts?: Date | null;
    /** Expiration date of the item (for open/ended items) */
    expires?: Date | null;
  };
  /** Whether to show a colored circle indicator */
  circle?: boolean;
  /** Whether to display inline (horizontal) layout */
  inline?: boolean;
}

const props = withDefaults(defineProps<ItemStatusTextProps>(), {
  circle: false,
  inline: false,
});

/**
 * Computed text for item status
 */
const text = computed(() => {
  if (props.item.status === ItemStatus.Scheduled && props.item.starts) {
    return t('item.status.startsIn', {
      duration: formatDistanceLocale(props.item.starts, new Date()),
    });
  } else if (props.item.status === ItemStatus.Open && props.item.expires) {
    return t('item.status.endsIn', {
      duration: formatDistanceLocale(props.item.expires, new Date()),
    });
  } else if (props.item.status === ItemStatus.Ended && props.item.expires) {
    return t('common.timeAgo', {
      time: formatDistanceLocale(props.item.expires, new Date()),
    });
  } else {
    return '';
  }
});
</script>
