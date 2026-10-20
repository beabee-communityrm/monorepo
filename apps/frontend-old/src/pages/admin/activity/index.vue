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
    >
      <template #actions>
        <AppButton
          :icon="faDownload"
          variant="primaryOutlined"
          :title="t('actions.export')"
          @click="handleExport"
        />
      </template>
      <template #value-createdAt="{ value }">
        <span class="whitespace-nowrap">{{ formatLocale(value, 'PPpp') }}</span>
      </template>
    </AppPaginatedTable>
  </AppFilterGrid>
</template>

<script lang="ts" setup>
import type { GetActivityEventData, Paginated } from '@beabee/beabee-common';
import {
  AppButton,
  AppFilterGrid,
  PageTitle,
  type TabItem,
  addNotification,
  formatLocale,
} from '@beabee/vue';

import { faDownload, faFileWaveform } from '@fortawesome/free-solid-svg-icons';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import AppPaginatedTable from '#components/table/AppPaginatedTable.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import type { Header } from '#type/table';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';
import { definePaginatedQuery } from '#utils/pagination';

const { t } = useI18n();

const filterItems = computed<TabItem[]>(() => [
  { id: 'all', label: t('activity.filters.all') },
  { id: 'contact', label: t('menu.contacts') },
  { id: 'callout', label: t('menu.callouts') },
  { id: 'email', label: t('menu.emails') },
  { id: 'payment', label: t('menu.payments') },
  { id: 'other', label: t('activity.filters.other') },
]);
const currentFilter = ref('all');

const headers = computed<Header[]>(() => [
  { value: 'createdAt', text: t('activity.data.time') },
  { value: 'eventType', text: t('activity.data.category') },
  { value: 'actorId', text: t('activity.data.actor') },
  { value: 'targetId', text: t('activity.data.target') },
]);

const currentPaginatedQuery = definePaginatedQuery('createdAt');

const activityTable = ref<Paginated<GetActivityEventData>>();

addBreadcrumb(
  computed(() => [
    { title: t('menu.activity'), to: '/admin/activity', icon: faFileWaveform },
  ])
);

/**
 * Action Handlers
 */

/**
 * Table state
 */
const isRefreshing = ref(false);

/**
 * Refreshes the activity table
 */
async function refreshResponses() {
  if (isRefreshing.value) return;

  isRefreshing.value = true;
  try {
    activityTable.value = await client.activity.list(
      currentPaginatedQuery.query
    );
  } catch (err) {
    activityTable.value = { items: [], offset: 0, count: 0, total: 0 };
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
  } finally {
    isRefreshing.value = false;
  }
}

watch(currentPaginatedQuery, () => refreshResponses(), { deep: true });
refreshResponses();

/**
 * Handles exporting activity feed
 */
function handleExport() {
  // const rules = getSearchRules();
  // const rulesQuery = encodeURIComponent(JSON.stringify(rules));
  // window.open(`/api/1.0/contact.csv?rules=${rulesQuery}`, '_blank');
}
</script>
