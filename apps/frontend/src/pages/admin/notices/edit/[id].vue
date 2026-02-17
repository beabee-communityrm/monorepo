<route lang="yaml">
name: adminNoticeEdit
meta:
  pageTitle: menu.notices
  role: admin
</route>

<template>
  <template v-if="notice">
    <PageTitle
      :title="t('editNotice.title', { title: notice.name })"
      border
    ></PageTitle>

    <div class="grid lg:grid-cols-2">
      <NoticeForm :notice="notice" @submit="handleSubmit"></NoticeForm>
    </div>
  </template>
</template>

<script lang="ts" setup>
import type { CreateNoticeData, GetNoticeData } from '@beabee/beabee-common';
import { PageTitle } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import { faSignHanging } from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import NoticeForm from '#components/notice/NoticeForm.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';

const { t } = useI18n();
const route = useRoute('adminNoticeEdit');
const router = useRouter();

const notice = ref<GetNoticeData | undefined>();

addBreadcrumb(
  computed(() => [
    { title: t('menu.notices'), to: '/admin/notices', icon: faSignHanging },
    ...(notice.value
      ? [
          {
            title: notice.value?.name || '',
            to: '/admin/notices/view/' + route.params.id,
          },
          { title: t('actions.edit') },
        ]
      : []),
  ])
);

onBeforeMount(async () => {
  notice.value = await client.notice.get(route.params.id);
});

async function handleSubmit(formData: CreateNoticeData) {
  if (!notice.value) return; // ToDo: Redirect to 404 if notice could not be fetched
  await client.notice.update(notice.value.id, formData);
  addNotification({
    variant: 'success',
    title: t('noticeAdminOverview.updated'),
  });
  router.push({ path: '/admin/notices/view/' + notice.value.id });
}
</script>
