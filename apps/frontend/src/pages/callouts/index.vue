<route lang="yaml">
name: callouts
meta:
  pageTitle: menu.callouts
</route>

<template>
  <PageTitle :title="t('menu.callouts')" />
  <div v-if="activeCallouts" class="-mx-3 mb-6 flex flex-wrap">
    <CalloutCard
      v-for="callout in activeCallouts.items"
      :key="callout.slug"
      :callout="callout"
      class="mx-3 mb-5"
    />
  </div>

  <AppHeading>{{ t('callouts.archive') }}</AppHeading>
  <div class="my-2 items-center justify-between lg:flex">
    <AppSearchInput
      v-model="currentSearch"
      :placeholder="t('callouts.search')"
    />
    <div class="my-2 text-sm font-semibold uppercase text-primary-80 lg:my-0">
      <span>{{ t('common.show') }}</span>
      <AppToggle
        v-model="currentShow"
        :items="[
          { id: 'all', label: t('callouts.showAll') },
          { id: 'answered', label: t('callouts.showAnswered') },
        ]"
      />
    </div>
  </div>

  <AppTable
    :headers="headers"
    :items="archivedCallouts?.items || null"
    class="mt-2 w-full whitespace-nowrap"
  >
    <template #empty>
      <p>{{ t('callouts.noArchivedCallouts') }}</p>
    </template>

    <template #value-name="{ item }">
      <router-link
        :to="`/callouts/${item.slug}`"
        class="text-base font-bold text-link"
        >{{ item.title }}</router-link
      >
    </template>

    <template #value-expires="{ item }">
      <AppTime v-if="item.expires" :datetime="item.expires" />
      <span v-else>-</span>
    </template>

    <template #value-answered="{ item }">
      <span v-if="item.hasAnswered">
        <font-awesome-icon :icon="faCheckCircle" />
        {{ t('callouts.showAnswered') }}
      </span>
    </template>
  </AppTable>

  <div class="ml-auto mt-3">
    <AppPagination v-model="currentPage" :total-pages="totalPages" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { ItemStatus, type Paginated } from '@beabee/beabee-common';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

import PageTitle from '@components/PageTitle.vue';
import AppHeading from '@components/AppHeading.vue';
import CalloutCard from '@components/callout/CalloutCard.vue';
import AppSearchInput from '@components/forms/AppSearchInput.vue';
import AppPagination from '@components/AppPagination.vue';
import AppToggle from '@components/forms/AppToggle.vue';
import type { Header } from '@components/table/table.interface';
import AppTable from '@components/table/AppTable.vue';
import AppTime from '@components/AppTime.vue';

import { fetchCallouts } from '@utils/api/callout';
import { defineParam } from '@utils/pagination';

import type {
  GetCalloutData,
  GetCalloutDataWith,
  GetCalloutsQuery,
} from '@beabee/beabee-common';

const { t } = useI18n();

const headers: Header[] = [
  { value: 'name', text: t('callouts.data.callout') },
  { value: 'expires', text: t('callouts.data.endDate') },
  { value: 'answered', text: '' },
];

const currentPage = defineParam('page', (v) => Number(v) || 0);
const currentSearch = defineParam('s', (v) => v || '');
const currentShow = defineParam('show', (v) =>
  v === 'answered' ? 'answered' : 'all'
);

const activeCallouts = ref<Paginated<GetCalloutData>>();
const archivedCallouts = ref<Paginated<GetCalloutDataWith<'hasAnswered'>>>();

const totalPages = computed(() =>
  archivedCallouts.value
    ? Math.ceil(archivedCallouts.value.total / pageSize)
    : 0
);
watch(totalPages, (value) => {
  if (currentPage.value > value) {
    currentPage.value = Math.max(0, value - 1);
  }
});

onBeforeMount(async () => {
  activeCallouts.value = await fetchCallouts({
    sort: 'starts',
    order: 'DESC',
    rules: {
      condition: 'AND',
      rules: [
        {
          field: 'status',
          operator: 'equal',
          value: [ItemStatus.Open],
        },
        {
          field: 'hidden',
          operator: 'equal',
          value: [false],
        },
      ],
    },
  });
});

const pageSize = 15;

watchEffect(async () => {
  const query: GetCalloutsQuery = {
    offset: currentPage.value * pageSize,
    limit: pageSize,
    sort: 'expires',
    order: 'DESC',
    rules: {
      condition: 'AND',
      rules: [
        {
          field: 'title',
          operator: 'contains',
          value: [currentSearch.value],
        },
        {
          field: 'hidden',
          operator: 'equal',
          value: [false],
        },
        {
          field: 'status',
          operator: 'equal',
          value: [ItemStatus.Ended],
        },
        ...(currentShow.value === 'answered'
          ? [
              {
                field: 'answeredBy',
                operator: 'equal' as const,
                value: ['me'],
              },
            ]
          : []),
      ],
    },
  };

  archivedCallouts.value = await fetchCallouts(query, ['hasAnswered']);
});
</script>
