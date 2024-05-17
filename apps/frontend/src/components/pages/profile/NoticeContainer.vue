<template>
  <section v-if="notices.length">
    <AppNotice v-for="notice in notices" :key="notice.id" :notice="notice" />
  </section>
</template>

<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';
import { onBeforeMount, ref } from 'vue';
import AppNotice from '@components/AppNotice.vue';
import { fetchNotices } from '@utils/api/notice';

import type { GetNoticeData } from '@type';

const notices = ref<GetNoticeData[]>([]);
const loading = ref(false);

onBeforeMount(() => {
  loading.value = true;
  fetchNotices({
    rules: {
      condition: 'AND',
      rules: [{ field: 'status', operator: 'equal', value: [ItemStatus.Open] }],
    },
  })
    .then((data) => {
      notices.value = data.items;
    })
    .catch((err) => err)
    .finally(() => (loading.value = false));
});
</script>
