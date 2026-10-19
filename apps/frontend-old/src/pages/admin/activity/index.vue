<route lang="yaml">
name: adminActivity
meta:
  pageTitle: menu.activity
  role: admin
</route>

<template>
  <PageTitle :title="t('menu.activity')" border />
  <AppFilterGrid v-model="currentFilter" :items="filterItems">
    <AppPaginatedTable
      v-model:query="currentPaginatedQuery"
      :headers="headers"
      :result="activityTable"
    />
  </AppFilterGrid>
</template>

<script lang="ts" setup>
import { AppFilterGrid, PageTitle, type TabItem } from '@beabee/vue';

import { faFileWaveform } from '@fortawesome/free-solid-svg-icons';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AppPaginatedTable from '#components/table/AppPaginatedTable.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import type { Paginated } from '#type/paginated';
import type { Header, Item } from '#type/table';
import { definePaginatedQuery } from '#utils/pagination';

const { t } = useI18n();

const filterItems = computed<TabItem[]>(() => [
  { id: 'contact', label: t('menu.contacts') },
  { id: 'callout', label: t('menu.callouts') },
  { id: 'email', label: t('menu.emails') },
  { id: 'payment', label: t('menu.payments') },
  { id: 'other', label: t('activity.filters.other') },
]);
const currentFilter = ref('contact');

const headers = computed<Header[]>(() => [
  { value: 'eventTime', text: t('activity.data.eventTime') },
  { value: 'eventType', text: t('activity.data.eventType') },
  { value: 'actor', text: t('activity.data.actor') },
  { value: 'target', text: t('activity.data.target') },
  { value: 'metadata', text: t('activity.data.metadata'), width: '100%' },
]);

const currentPaginatedQuery = definePaginatedQuery('eventTime');

// TODO: Load activity data from the API
const activityTable = ref<Paginated<Item>>({
  items: [],
  offset: 0,
  count: 0,
  total: 0,
});

addBreadcrumb(
  computed(() => [
    { title: t('menu.activity'), to: '/admin/activity', icon: faFileWaveform },
  ])
);
</script>
