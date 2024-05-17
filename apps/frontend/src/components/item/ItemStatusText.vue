<template>
  <div class="flex" :class="inline ? 'gap-2' : 'flex-col'">
    <AppItemStatus :status="item.status" :circle="circle" />
    <span v-if="item.status === ItemStatus.Scheduled && item.starts">
      {{
        t('item.status.startsIn', {
          duration: formatDistanceLocale(item.starts, new Date()),
        })
      }}
    </span>
    <span v-else-if="item.status === ItemStatus.Open && item.expires">
      {{
        t('item.status.endsIn', {
          duration: formatDistanceLocale(item.expires, new Date()),
        })
      }}
    </span>
    <span v-else-if="item.status === ItemStatus.Ended && item.expires">
      {{
        t('common.timeAgo', {
          time: formatDistanceLocale(item.expires, new Date()),
        })
      }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';

import { formatDistanceLocale } from '@utils/dates';

import AppItemStatus from '@components/AppItemStatus.vue';

import type { ItemWithStatus } from '@type';

const { t } = useI18n();

defineProps<{ item: ItemWithStatus; circle?: boolean; inline?: boolean }>();
</script>
