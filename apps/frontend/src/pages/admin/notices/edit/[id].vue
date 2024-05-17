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
import { faSignHanging } from '@fortawesome/free-solid-svg-icons';
import { ref, onBeforeMount, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import NoticeForm from '@components/notice/NoticeForm.vue';
import PageTitle from '@components/PageTitle.vue';

import { updateNotice, fetchNotice } from '@utils/api/notice';

import { addBreadcrumb } from '@store/breadcrumb';
import { addNotification } from '@store/notifications';

import type { CreateNoticeData, GetNoticeData } from '@type';

const { t } = useI18n();
const router = useRouter();

const props = defineProps<{ id: string }>();
const notice = ref<GetNoticeData | undefined>();

addBreadcrumb(
  computed(() => [
    { title: t('menu.notices'), to: '/admin/notices', icon: faSignHanging },
    ...(notice.value
      ? [
          {
            title: notice.value?.name || '',
            to: '/admin/notices/view/' + props.id,
          },
          { title: t('actions.edit') },
        ]
      : []),
  ])
);

onBeforeMount(async () => {
  notice.value = await fetchNotice(props.id as string);
});

async function handleSubmit(formData: CreateNoticeData) {
  if (!notice.value) return; // ToDo: Redirect to 404 if notice could not be fetched
  await updateNotice(notice.value.id, formData);
  addNotification({
    variant: 'success',
    title: t('noticeAdminOverview.updated'),
  });
  router.push({ path: '/admin/notices/view/' + notice.value.id });
}
</script>
