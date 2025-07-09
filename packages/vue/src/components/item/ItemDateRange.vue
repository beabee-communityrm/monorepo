<!--
  # ItemDateRange
  A component for displaying date ranges with start and end dates.
  Supports different date formats and optional icons for visual context.
-->
<template>
  <p v-if="starts" class="flex items-center">
    <font-awesome-icon v-if="showIcon" :icon="faCalendar" class="mr-1" />
    {{ formatLocale(starts, dateFormat) }}
    <span v-if="expires" class="mx-1">{{ separator }}</span>
    <span v-if="expires">{{ formatLocale(expires, dateFormat) }}</span>
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
 * <ItemDateRange
 *   :starts="new Date('2023-01-01')"
 *   :expires="new Date('2023-12-31')"
 *   date-format="PP"
 * />
 */
import { faCalendar } from '@fortawesome/free-regular-svg-icons';

import { formatLocale } from '../../utils/dates';

/**
 * Props for the ItemDateRange component
 */
export interface ItemDateRangeProps {
  /** Start date of the range */
  starts: Date | null;
  /** End date of the range (optional) */
  expires?: Date | null;
  /** Date format string (date-fns format) */
  dateFormat?: string;
  /** Separator between start and end dates */
  separator?: string;
  /** Whether to show the calendar icon */
  showIcon?: boolean;
}

const props = withDefaults(defineProps<ItemDateRangeProps>(), {
  expires: null,
  dateFormat: 'PP',
  separator: ' - ',
  showIcon: true,
});
</script>
