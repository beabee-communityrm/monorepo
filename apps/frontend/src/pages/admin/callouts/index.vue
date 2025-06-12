<route lang="yaml">
name: adminCallouts
meta:
  pageTitle: menu.callouts
</route>
<template>
  <PageTitle :title="t('menu.callouts')" border>
    <div class="flex-0 ml-3 hidden md:block">
      <AppButton to="/admin/callouts/new">{{
        t('calloutsAdmin.addCallout')
      }}</AppButton>
    </div>
    <div class="fixed bottom-5 right-5 md:hidden">
      <AppButton
        :icon="faPlus"
        :title="t('calloutsAdmin.addCallout')"
        class="rounded-full drop-shadow-md"
        size="lg"
        to="/admin/callouts/new"
      />
    </div>
  </PageTitle>

  <AppFilterGrid v-model="currentStatus" :items="statusItems">
    <div class="flex">
      <AppSearchInput
        v-model="currentSearch"
        :placeholder="t('callouts.search')"
      />
    </div>
    <AppPaginatedTable
      v-model:query="currentPaginatedQuery"
      keypath="callouts.showingOf"
      :headers="headers"
      :result="calloutsTable"
    >
      <template #header-hidden><font-awesome-icon :icon="faEye" /></template>
      <template #value-status="{ value }">
        <AppItemStatus :status="value" />
      </template>
      <template #value-title="{ item, value }">
        <router-link
          :to="'/admin/callouts/view/' + item.slug"
          class="text-base font-bold text-link"
        >
          {{ value }}
        </router-link>
      </template>
      <template #value-hidden="{ value }">
        <font-awesome-icon
          :class="value ? 'text-body-60' : 'text-body-80'"
          :icon="value ? faEyeSlash : faEye"
        />
      </template>
      <template #value-starts="{ value }">
        <span class="whitespace-nowrap">{{
          value && formatLocale(value, 'PP')
        }}</span>
      </template>
      <template #value-expires="{ value }">
        <span class="whitespace-nowrap">{{
          value && formatLocale(value, 'PP')
        }}</span>
      </template>
    </AppPaginatedTable>
  </AppFilterGrid>
</template>

<script lang="ts" setup>
import type {
  GetCalloutDataWith,
  GetCalloutsQuery,
  Paginated,
} from '@beabee/beabee-common';
import { AppButton } from '@beabee/vue/components';

import AppFilterGrid from '@components/AppFilterGrid.vue';
import AppItemStatus from '@components/AppItemStatus.vue';
import PageTitle from '@components/PageTitle.vue';
import AppSearchInput from '@components/forms/AppSearchInput.vue';
import AppPaginatedTable from '@components/table/AppPaginatedTable.vue';
import type { Header } from '@components/table/table.interface';
import {
  faBullhorn,
  faEye,
  faEyeSlash,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { formatLocale } from '@utils/dates';
import { definePaginatedQuery, defineParam } from '@utils/pagination';
import { computed, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

addBreadcrumb(
  computed(() => [
    {
      title: t('menu.callouts'),
      icon: faBullhorn,
      to: '/admin/callouts',
    },
  ])
);

const statusItems = computed(() => [
  {
    id: '',
    label: t('calloutsAdmin.filter.all'),
    to: '/admin/callouts',
  },
  {
    id: 'open',
    label: t('calloutsAdmin.filter.open'),
    to: '/admin/callouts?filter=open',
  },
  {
    id: 'scheduled',
    label: t('calloutsAdmin.filter.scheduled'),
    to: '/admin/callouts?filter=scheduled',
  },
  {
    id: 'ended',
    label: t('calloutsAdmin.filter.ended'),
    to: '/admin/callouts?filter=ended',
  },
  {
    id: 'draft',
    label: t('calloutsAdmin.filter.draft'),
    to: '/admin/callouts?filter=draft',
  },
]);

const headers: Header[] = [
  {
    value: 'status',
    text: t('calloutsAdmin.data.status'),
  },
  {
    value: 'title',
    text: t('calloutsAdmin.data.title'),
    sortable: true,
    width: '100%',
  },
  {
    value: 'hidden',
    text: '',
  },
  {
    value: 'responseCount',
    text: t('calloutsAdmin.data.responses'),
    align: 'right',
  },
  {
    value: 'starts',
    text: t('calloutsAdmin.data.starts'),
    align: 'right',
    sortable: true,
  },
  {
    value: 'expires',
    text: t('calloutsAdmin.data.expires'),
    align: 'right',
    sortable: true,
  },
];

const currentSearch = defineParam('s', (v) => v || '');
const currentStatus = defineParam('filter', (v) => v || '');
const currentPaginatedQuery = definePaginatedQuery('starts');

const calloutsTable = ref<Paginated<GetCalloutDataWith<'responseCount'>>>();

watchEffect(async () => {
  const rules: GetCalloutsQuery['rules'] = {
    condition: 'AND',
    rules: [
      {
        field: 'canReview',
        operator: 'equal',
        value: [true],
      },
      ...(currentStatus.value
        ? [
            {
              field: 'status',
              operator: 'equal' as const,
              value: [currentStatus.value],
            },
          ]
        : []),
      ...(currentSearch.value
        ? [
            {
              field: 'title',
              operator: 'contains' as const,
              value: [currentSearch.value],
            },
          ]
        : []),
    ],
  };
  calloutsTable.value = await client.callout.list(
    {
      ...currentPaginatedQuery.query,
      rules: rules.rules.length > 0 ? rules : undefined,
    },
    ['responseCount']
  );
});
</script>
