<!--
  # AppTime
  Displays relative time from a date to the current time.
  
  ## Features
  - Displays relative time (e.g., "2 hours ago", "in 3 days")
  - Supports both past and future dates
  - Includes formatted title for accessibility
  - Locale support for date formatting
  
  ## Usage
  ```vue
<AppTime :datetime="new Date()" />
<AppTime :datetime="'2024-01-15T10:30:00Z'" />
<AppTime :datetime="1705315800000" />
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
import type { BaseLocale } from '@beabee/locale';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatDistanceLocale, formatLocale } from '../../utils/dates';

const { t } = useI18n();

export interface AppTimeProps {
  /** The date to display time for (Date object, ISO string, or timestamp) */
  datetime: Date | string | number;
  /** Only display relative time without prefix/suffix */
  timeOnly?: boolean;
  /** Locale for date formatting */
  locale?: BaseLocale;
}

const props = withDefaults(defineProps<AppTimeProps>(), {
  timeOnly: false,
  locale: 'en',
});

const dateObject = computed(() => {
  if (props.datetime instanceof Date) {
    return props.datetime;
  }
  return new Date(props.datetime);
});

const label = computed(() => {
  const now = new Date();
  const time = formatDistanceLocale(dateObject.value, now, props.locale);

  if (props.timeOnly) {
    return time;
  }

  const template = dateObject.value > now ? 'common.timeIn' : 'common.timeAgo';

  return t(template, { time });
});
</script>
