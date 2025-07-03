<route lang="yaml">
name: adminNoticeView
meta:
  pageTitle: menu.notices
  role: admin
</route>

<template>
  <template v-if="notice">
    <PageTitle :title="`${notice.name}`"></PageTitle>
    <div class="flex flex-col-reverse gap-8 lg:flex-row lg:justify-between">
      <div class="flex-initial basis-3/4">
        <AppHeading>{{ t('noticeAdminOverview.summary') }}</AppHeading>
        <AppNotice :notice="notice"></AppNotice>
        <ItemStatusText
          :status="notice.status"
          :starts="notice.starts"
          :expires="notice.expires"
        />
        <ItemDateRange
          :starts="notice.starts"
          :expires="notice.expires"
          :locale="locale as BaseLocale"
        />
      </div>

      <div class="flex-0 flex flex-wrap gap-2 lg:flex-col">
        <ActionButton
          :icon="faPencilAlt"
          :to="`/admin/notices/edit/${notice.id}`"
        >
          {{ t('actions.edit') }}
        </ActionButton>

        <ActionButton :icon="faTrash" @click="showDeleteModal = true">
          {{ t('actions.delete') }}
        </ActionButton>

        <AppConfirmDialog
          :open="showDeleteModal"
          :title="t('noticeAdminOverview.actions.confirmDelete.title')"
          :cancel="t('actions.noBack')"
          :confirm="t('actions.yesDelete')"
          variant="danger"
          @close="showDeleteModal = false"
          @confirm="confirmDeleteNotice"
        >
          <p>{{ t('noticeAdminOverview.actions.confirmDelete.text') }}</p>
        </AppConfirmDialog>
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import type { GetNoticeData } from '@beabee/beabee-common';
import type { BaseLocale } from '@beabee/locale';
import {
  ActionButton,
  AppConfirmDialog,
  AppHeading,
  ItemDateRange,
  PageTitle,
} from '@beabee/vue';

import AppNotice from '@components/notice/AppNotice.vue';
import {
  faPencilAlt,
  faSignHanging,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import ItemStatusText from '../../../../components/item/ItemStatusText.vue';

const props = defineProps<{ id: string }>();
const { t, locale } = useI18n();

const notice = ref<GetNoticeData | undefined>();
const router = useRouter();

addBreadcrumb(
  computed(() => [
    { title: t('menu.notices'), to: '/admin/notices', icon: faSignHanging },
    { title: notice.value?.name || '' },
  ])
);

const showDeleteModal = ref(false);

onBeforeMount(async () => {
  notice.value = await client.notice.get(props.id);
});

async function confirmDeleteNotice() {
  await client.notice.delete(props.id);
  router.push({
    path: '/admin/notices',
    query: { deleted: null },
  });
}
</script>
