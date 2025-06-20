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
        <ItemStatus :item="notice"></ItemStatus>
        <ItemDateRange :item="notice" />
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
import { ActionButton } from '@beabee/vue/components';

import AppConfirmDialog from '@components/AppConfirmDialog.vue';
import AppHeading from '@components/AppHeading.vue';
import AppNotice from '@components/AppNotice.vue';
import PageTitle from '@components/PageTitle.vue';
import ItemDateRange from '@components/item/ItemDateRange.vue';
import ItemStatus from '@components/item/ItemStatusText.vue';
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

const props = defineProps<{ id: string }>();
const { t } = useI18n();

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
