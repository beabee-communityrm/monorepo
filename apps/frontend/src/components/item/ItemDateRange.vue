<template>
  <p v-if="item.starts" class="flex items-center">
    <font-awesome-icon :icon="faCalendar" class="mr-1" />
    {{ formatLocale(item.starts, 'PP') + ' - ' }}
    {{ item.expires && formatLocale(item.expires, 'PP') }}
  </p>
</template>

<script lang="ts" setup>
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { formatLocale } from '@utils/dates';

import type { ItemWithStatus } from '@type';

defineProps<{ item: ItemWithStatus; inline?: boolean }>();
</script>
