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
          :to="`/admin/crowdnewsroom/view/${item.callout.slug}/responses/${item.id}`"
          class="text-base font-bold text-link"
        >
          {{ item.id }}
        </router-link>
      </template>
      <template #value-callout="{ value }">
        <router-link
          :to="`/admin/crowdnewsroom/view/${value.slug}`"
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
import {
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  type GetContactData,
  type Paginated,
} from '@beabee/beabee-common';
import { type Header, formatLocale } from '@beabee/vue';

import { ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import { client } from '#utils/api';
import { definePaginatedQuery } from '#utils/pagination';

import AppPaginatedTable from '../../../../components/table/AppPaginatedTable.vue';

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

const responses =
  ref<Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>>>();

const currentPaginatedQuery = definePaginatedQuery('createdAt');

watchEffect(async () => {
  responses.value = await client.callout.response.list(
    {
      ...currentPaginatedQuery.query,
      rules: {
        condition: 'AND',
        rules: [
          { field: 'contact', operator: 'equal', value: [props.contact.id] },
        ],
      },
    },
    [GetCalloutResponseWith.Callout]
  );
});
</script>
