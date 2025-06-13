<!--
  # AppTime
  A component that displays the relative time from a date to the current time.
  
  ## Features
  - Displays relative time (e.g., "2 hours ago", "in 3 days")
  - Supports both past and future dates
  - Includes formatted title for accessibility
  - Customizable text templates via props
  - Locale support for date formatting
  
  ## Usage
  ```vue
<AppTime :datetime="new Date()" />

<AppTime :datetime="'2024-01-15T10:30:00Z'" />

<AppTime :datetime="1705315800000" />

<AppTime
  :datetime="someDate"
  time-ago-template="{time} ago"
  time-in-template="in {time}"
/>
``` -->
<template>
  <time
    :datetime="dateObject.toISOString()"
    :title="formatLocale(dateObject, 'PPpp', locale)"
    class="whitespace-nowrap"
    role="time"
    :aria-label="`${label} (${formatLocale(dateObject, 'PPpp', locale)})`"
  >
    {{ label }}
  </time>
</template>

<script lang="ts" setup>
/**
 * Component for displaying relative time with accessibility support.
 *
 * @component AppTime
 */
import type { BaseLocale } from '@beabee/locale';

import { computed } from 'vue';

import { formatDistanceLocale, formatLocale } from '../../utils/dates';

/**
 * Props for the AppTime component
 */
export interface AppTimeProps {
  /** The date to display time for (Date object, ISO string, or timestamp) */
  datetime: Date | string | number;
  /** Only display relative time without prefix/suffix */
  timeOnly?: boolean;
  /** Template for past dates, use {time} as placeholder */
  timeAgoTemplate?: string;
  /** Template for future dates, use {time} as placeholder */
  timeInTemplate?: string;
  /** Locale for date formatting */
  locale?: BaseLocale;
}

const props = withDefaults(defineProps<AppTimeProps>(), {
  timeOnly: false,
  timeAgoTemplate: '{time} ago',
  timeInTemplate: 'in {time}',
  locale: 'en',
});

/**
 * Converts the datetime prop to a Date object
 */
const dateObject = computed(() => {
  if (props.datetime instanceof Date) {
    return props.datetime;
  }
  return new Date(props.datetime);
});

/**
 * Computed label that shows the relative time
 */
const label = computed(() => {
  const now = new Date();
  const time = formatDistanceLocale(dateObject.value, now, props.locale);

  if (props.timeOnly) {
    return time;
  }

  const template =
    dateObject.value > now ? props.timeInTemplate : props.timeAgoTemplate;

  return template.replace('{time}', time);
});
</script>
