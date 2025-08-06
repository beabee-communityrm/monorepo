<!--
  # ItemDateRange
  A component for displaying date ranges with start and end dates.
  Supports different date formats and optional icons for visual context.
-->
<template>
  <p v-if="item.starts" class="flex items-center">
    <font-awesome-icon v-if="showIcon" :icon="faCalendar" class="mr-1" />
    {{ formatLocale(item.starts, dateFormat) }}
    <span v-if="item.expires" class="mx-1">{{ separator }}</span>
    <span v-if="item.expires">{{
      formatLocale(item.expires, dateFormat)
    }}</span>
  </p>
</template>

<script lang="ts" setup>
/**
 * Component for displaying date ranges with customizable formatting.
 * Shows start and optional end dates with configurable separators and icons.
 *
 * @component ItemDateRange
 *
 * @example
 * <ItemDateRange :item="item" date-format="PP" />
 */
import { faCalendar } from '@fortawesome/free-regular-svg-icons';

import { formatLocale } from '../../utils/dates';

/**
 * Props for the ItemDateRange component
 */
export interface ItemDateRangeProps {
  item: {
    /** Start date of the range */
    starts: Date | null;
    /** End date of the range (optional) */
    expires?: Date | null;
  };
  /** Date format string (date-fns format) */
  dateFormat?: string;
  /** Separator between start and end dates */
  separator?: string;
  /** Whether to show the calendar icon */
  showIcon?: boolean;
}

withDefaults(defineProps<ItemDateRangeProps>(), {
  dateFormat: 'PP',
  separator: ' - ',
  showIcon: true,
});
</script>
