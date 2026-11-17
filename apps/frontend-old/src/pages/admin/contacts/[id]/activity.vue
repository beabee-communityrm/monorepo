<route lang="yaml">
name: adminContactsViewActivity
meta:
  pageTitle: menu.contacts
  role: admin
</route>
<template>
  <div>
    <AppPaginatedTable
      v-model:query="currentPaginatedQuery"
      :headers="headers"
      :result="activity"
    >
      <template #value-createdAt="{ value }">
        {{ formatLocale(value, 'Pp') }}
      </template>
      <template #value-eventType="{ value }">
        {{ getEventTypeLabel(value) }}
      </template>
    </AppPaginatedTable>
  </div>
</template>
<script lang="ts" setup>
import type {
  GetActivityEventData,
  GetContactData,
  Paginated,
} from '@beabee/beabee-common';
import { type Header, formatLocale, addNotification } from '@beabee/vue';

import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getEventTypeLabel } from '#utils/activity';
import { client } from '#utils/api';
import { extractErrorText } from '#utils/api-error';

import { definePaginatedQuery } from '#utils/pagination';

import AppPaginatedTable from '../../../../components/table/AppPaginatedTable.vue';

const props = defineProps<{
  contact: GetContactData;
}>();

const { t } = useI18n();

const headers: Header[] = [
  { value: 'createdAt', text: t('activity.data.time') },
  { value: 'eventType', text: t('activity.data.eventType') },
  { value: 'actorId', text: t('activity.data.actor') },
  { value: 'targetId', text: t('activity.data.target') },
];

const currentPaginatedQuery = definePaginatedQuery('createdAt');

const activity = ref<Paginated<GetActivityEventData>>();

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
    activity.value = await client.contact.listActivity(props.contact.id, {
      ...currentPaginatedQuery.query,
    });
  } catch (err) {
    activity.value = { items: [], offset: 0, count: 0, total: 0 };
    addNotification({
      variant: 'error',
      title: extractErrorText(err),
    });
  } finally {
    isRefreshing.value = false;
  }
}

watch([currentPaginatedQuery], () => refreshResponses(), {
  deep: true,
});
refreshResponses();
</script>
