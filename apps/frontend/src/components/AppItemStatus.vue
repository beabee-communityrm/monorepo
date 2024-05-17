<template>
  <span class="text-sm font-bold uppercase" :class="color[status]"
    ><span
      v-if="circle"
      class="-mt-px inline-block h-3 w-3 rounded-full bg-[currentColor] align-middle"
    />
    {{ t('common.status.' + status) }}</span
  >
</template>
<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const color = {
  draft: 'text-body-60',
  scheduled: 'text-warning',
  open: 'text-success',
  ended: 'text-body-80',
};
defineProps<{ status: ItemStatus; circle?: boolean }>();
</script>
