<template>
  <section v-if="notices.length" class="flex flex-col gap-3">
    <NoticeBanner v-for="notice in notices" :key="notice.id" :notice="notice" />
  </section>
</template>

<script lang="ts" setup>
import { type GetNoticeData, ItemStatus } from '@beabee/beabee-common';

import { onBeforeMount, ref } from 'vue';

import NoticeBanner from '#components/notice/NoticeBanner.vue';
import { client } from '#utils/api';

const notices = ref<GetNoticeData[]>([]);
const loading = ref(false);

onBeforeMount(() => {
  loading.value = true;
  client.notice
    .list({
      rules: {
        condition: 'AND',
        rules: [
          { field: 'status', operator: 'equal', value: [ItemStatus.Open] },
        ],
      },
    })
    .then((data) => {
      notices.value = data.items;
    })
    .catch((err) => err)
    .finally(() => (loading.value = false));
});
</script>
