<route lang="yaml">
name: adminContactsViewCallouts
meta:
  pageTitle: menu.contacts
  role: admin
</route>
<template>
  <div>
    <AppPaginatedTable
      v-model:query="currentPaginatedQuery"
      keypath="calloutResponsesPage.showingOf"
      :headers="headers"
      :result="responses"
    >
      <template #value-response="{ item }">
        <router-link
          :to="`/admin/callouts/view/${item.callout.slug}/responses/${item.id}`"
          class="text-base font-bold text-link"
        >
          {{ item.id }}
        </router-link>
      </template>
      <template #value-callout="{ value }">
        <router-link
          :to="`/admin/callouts/view/${value.slug}`"
          class="text-link"
        >
          {{ value.title }}
        </router-link>
      </template>
      <template #value-createdAt="{ value }">
        {{ formatLocale(value, 'Pp') }}
      </template>
    </AppPaginatedTable>
  </div>
</template>
<script lang="ts" setup>
import type { Paginated } from '@beabee/beabee-common';
import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Header } from '@components/table/table.interface';
import { formatLocale } from '@utils/dates';
import { fetchCalloutResponses } from '@utils/api/callout-response';
import { definePaginatedQuery } from '@utils/pagination';
import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';

import type { GetCalloutResponseDataWith, GetContactData } from '@type';

const props = defineProps<{
  contact: GetContactData;
}>();

const { t } = useI18n();

const headers: Header[] = [
  {
    value: 'response',
    text: t('calloutResponsesPage.response'),
  },
  {
    value: 'callout',
    text: t('calloutResponse.data.callout'),
  },
  {
    value: 'tags',
    text: t('calloutResponse.data.tags'),
  },
  {
    value: 'createdAt',
    text: t('calloutResponse.data.createdAt'),
    sortable: true,
    align: 'right',
  },
];

const responses = ref<Paginated<GetCalloutResponseDataWith<'callout'>>>();

const currentPaginatedQuery = definePaginatedQuery('createdAt');

watchEffect(async () => {
  responses.value = await fetchCalloutResponses(
    {
      ...currentPaginatedQuery.query,
      rules: {
        condition: 'AND',
        rules: [
          { field: 'contact', operator: 'equal', value: [props.contact.id] },
        ],
      },
    },
    ['callout']
  );
});
</script>
