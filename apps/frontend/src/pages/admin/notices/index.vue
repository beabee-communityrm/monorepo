<route lang="yaml">
name: adminNotices
meta:
  role: admin
  pageTitle: menu.notices
</route>

<template>
  <PageTitle :title="t('menu.notices')" border>
    <div class="flex-0 ml-3 hidden md:block">
      <AppButton to="/admin/notices/add">{{
        t('notices.addNotice')
      }}</AppButton>
    </div>
    <div class="fixed bottom-5 right-5 md:hidden">
      <AppButton
        :icon="faPlus"
        :title="t('notices.addNotice')"
        class="rounded-full drop-shadow-md"
        size="lg"
        to="/admin/notices/add"
      />
    </div>
  </PageTitle>
  <AppPaginatedTable
    v-model:query="currentPaginatedQuery"
    keypath="notices.showingOf"
    :headers="headers"
    :result="noticesTable"
  >
    <template #value-status="{ value }">
      <AppItemStatus :status="value" />
    </template>
    <template #value-name="{ item, value }">
      <router-link
        :to="'/admin/notices/view/' + item.id"
        class="text-base font-bold text-link"
      >
        {{ value }}
      </router-link>
    </template>
    <template #value-createdAt="{ value }">
      <span class="whitespace-nowrap">{{ formatLocale(value, 'PP') }}</span>
    </template>
  </AppPaginatedTable>
</template>
<script lang="ts" setup>
import type { Paginated } from '@beabee/beabee-common';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { faPlus, faSignHanging } from '@fortawesome/free-solid-svg-icons';

import AppButton from '@components/button/AppButton.vue';
import PageTitle from '@components/PageTitle.vue';
import type { Header } from '@components/table/table.interface';
import AppItemStatus from '@components/AppItemStatus.vue';
import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';

import { addBreadcrumb } from '@store/breadcrumb';

import { fetchNotices } from '@utils/api/notice';
import { formatLocale } from '@utils/dates';
import { definePaginatedQuery } from '@utils/pagination';

import type { GetNoticeData } from '@type';

const { t } = useI18n();

addBreadcrumb(
  computed(() => [{ title: t('menu.notices'), icon: faSignHanging }])
);

const headers: Header[] = [
  {
    value: 'status',
    text: t('notices.data.status'),
  },
  {
    value: 'name',
    text: t('notices.data.name'),
    sortable: true,
    width: '100%',
  },
  {
    value: 'createdAt',
    text: t('notices.data.createdAt'),
    align: 'right',
    sortable: true,
  },
];

const currentPaginatedQuery = definePaginatedQuery('createdAt');

const noticesTable = ref<Paginated<GetNoticeData>>();

watchEffect(async () => {
  noticesTable.value = await fetchNotices(currentPaginatedQuery.query);
});
</script>
