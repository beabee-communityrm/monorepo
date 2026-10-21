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
    </AppPaginatedTable>
  </div>
</template>
<script lang="ts" setup>
import type {
  GetActivityEventData,
  GetContactData,
  Paginated,
} from '@beabee/beabee-common';
import { type Header, formatLocale } from '@beabee/vue';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { definePaginatedQuery } from '#utils/pagination';

import AppPaginatedTable from '../../../../components/table/AppPaginatedTable.vue';

defineProps<{
  contact: GetContactData;
}>();

const { t } = useI18n();

const headers: Header[] = [
  { value: 'createdAt', text: t('activity.data.time') },
  { value: 'eventType', text: t('activity.data.category') },
  { value: 'actorId', text: t('activity.data.actor') },
  { value: 'targetId', text: t('activity.data.target') },
];

const currentPaginatedQuery = definePaginatedQuery('createdAt');

// TODO: Load the contact's activity events
const activity = ref<Paginated<GetActivityEventData>>({
  items: [],
  offset: 0,
  count: 0,
  total: 0,
});
</script>
