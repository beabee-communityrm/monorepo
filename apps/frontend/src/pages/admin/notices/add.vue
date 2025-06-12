<route lang="yaml">
name: adminNoticesAdd
meta:
  role: admin
  pageTitle: menu.notices
</route>

<template>
  <PageTitle :title="t('addNotice.title')" border></PageTitle>
  <App2ColGrid>
    <template #col1>
      <NoticeForm :notice="undefined" @submit="handleSubmit"></NoticeForm>
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import type { CreateNoticeData, GetNoticeData } from '@beabee/beabee-common';
import { App2ColGrid, addNotification } from '@beabee/vue';

import PageTitle from '@components/PageTitle.vue';
import NoticeForm from '@components/notice/NoticeForm.vue';
import { faSignHanging } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

addBreadcrumb(
  computed(() => [
    { title: t('menu.notices'), to: '/admin/notices', icon: faSignHanging },
    { title: t('addNotice.title') },
  ])
);

async function handleSubmit(noticeData: CreateNoticeData) {
  const notice: GetNoticeData = await client.notice.create(noticeData);
  addNotification({
    variant: 'success',
    title: t('noticeAdminOverview.created'),
  });
  router.push({ path: '/admin/notices/view/' + notice.id });
}
</script>
