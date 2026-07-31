<route lang="yaml">
name: callouts
meta:
  pageTitle: menu.callouts
</route>

<template>
  <div class="nuxt-page">
    <template v-if="activeCallouts">
      <h2 class="sr-only">{{ t('callouts.openCallouts') }}</h2>
      <div
        v-if="activeCallouts.items.length > 0"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <CalloutCard
          v-for="callout in activeCallouts.items"
          :key="callout.slug"
          :callout="callout"
        />
      </div>
      <p v-else class="text-muted py-16 text-center">
        {{ t('callouts.empty.active') }}
      </p>
    </template>

    <div class="mt-10">
      <UCard
        :ui="{ root: 'divide-y-0', header: 'p-0 sm:p-0', body: 'p-0 sm:p-0' }"
      >
        <template #header>
          <h2>
            <UButton
              variant="ghost"
              color="neutral"
              block
              class="justify-between px-5 py-3.5"
              @click="toggleArchive"
            >
              <span
                class="text-highlighted flex items-center gap-2 text-base font-semibold"
              >
                <UIcon name="i-lucide-archive" class="text-muted size-4" />
                {{ t('callouts.archive') }}
                <UBadge color="neutral" variant="subtle" size="sm">
                  {{ archivedTotal ?? 0 }}
                </UBadge>
              </span>
              <UIcon
                name="i-lucide-chevron-down"
                class="text-muted size-4 transition-transform"
                :class="archiveOpen && 'rotate-180'"
              />
            </UButton>
          </h2>
        </template>

        <template v-if="archiveOpen">
          <div
            class="border-default flex flex-wrap items-center gap-3 border-t p-4"
          >
            <UInput
              v-model="archiveSearchInput"
              icon="i-lucide-search"
              :placeholder="t('callouts.search')"
              variant="subtle"
              class="w-full sm:w-64"
              @keyup.enter="archiveSearch = archiveSearchInput"
              @blur="archiveSearch = archiveSearchInput"
            >
              <template v-if="archiveSearchInput" #trailing>
                <UButton
                  icon="i-lucide-x"
                  color="neutral"
                  variant="link"
                  size="sm"
                  :aria-label="t('actions.clearSearch')"
                  @click="clearArchiveSearch"
                />
              </template>
            </UInput>

            <UButton
              :aria-pressed="archiveRespondedOnly"
              :color="archiveRespondedOnly ? 'primary' : 'neutral'"
              :variant="archiveRespondedOnly ? 'subtle' : 'outline'"
              class="shrink-0"
              @click="toggleArchiveRespondedOnly"
            >
              <UIcon
                name="i-lucide-check"
                aria-hidden="true"
                class="size-3.5 transition-opacity"
                :class="archiveRespondedOnly ? 'opacity-100' : 'opacity-40'"
              />
              {{ t('callouts.showAnswered') }}
            </UButton>
          </div>

          <div
            v-if="archivedCallouts && archivedCallouts.items.length > 0"
            class="border-default divide-default divide-y border-t"
          >
            <CalloutArchiveRow
              v-for="callout in archivedCallouts.items"
              :key="callout.slug"
              :callout="callout"
            />
          </div>
          <p
            v-else
            class="text-muted border-default border-t px-4 py-8 text-center"
          >
            {{ t('callouts.noArchivedCallouts') }}
          </p>

          <div
            v-if="archiveTotalPages > 1"
            class="border-default flex items-center justify-between border-t p-4"
          >
            <span class="text-muted text-sm">
              {{
                t('callouts.archiveRange', {
                  start: archivePage * archivePageSize + 1,
                  end: Math.min(
                    (archivePage + 1) * archivePageSize,
                    archivedCallouts?.total ?? 0
                  ),
                  total: archivedCallouts?.total ?? 0,
                })
              }}
            </span>
            <UPagination
              variant="subtle"
              :default-page="archivePage + 1"
              :page="archivePage + 1"
              :total="archivedCallouts?.total ?? 0"
              :items-per-page="archivePageSize"
              @update:page="(p: number) => (archivePage = p - 1)"
            />
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  type GetCalloutsQuery,
  ItemStatus,
  type Paginated,
} from '@beabee/beabee-common';

import { computed, onBeforeMount, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';

import CalloutArchiveRow from '#components/callout/CalloutArchiveRow.vue';
import CalloutCard from '#components/callout/CalloutCard.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { defineParam } from '#utils/pagination';
import { routeIcons, routeLabels } from '#utils/route-nav';
import type { CalloutCardData } from '#type';

const calloutWiths = [
  'hasAnswered',
  'responseCount',
  'responseViewSchema',
] as const;

const { t } = useI18n();

addBreadcrumb(
  computed(() => [
    {
      label: t(routeLabels.callouts),
      to: '/crowdnewsroom',
      icon: routeIcons.callouts,
    },
  ])
);

const archiveSearch = defineParam('s', (v) => v || '');
const archiveSearchInput = ref(archiveSearch.value);
const archiveShow = defineParam('show', (v) => (v === 'answered' ? v : ''));
const archiveRespondedOnly = computed({
  get: () => archiveShow.value === 'answered',
  set: (value: boolean) => {
    archiveShow.value = value ? 'answered' : '';
  },
});
const archivePage = defineParam('page', (v) => Number(v) || 0);
const archiveOpen = ref(false);

function toggleArchive() {
  archiveOpen.value = !archiveOpen.value;
}

function toggleArchiveRespondedOnly() {
  archiveRespondedOnly.value = !archiveRespondedOnly.value;
}

function clearArchiveSearch() {
  archiveSearchInput.value = '';
  archiveSearch.value = '';
}

const archivePageSize = 15;

const activeCallouts = ref<Paginated<CalloutCardData>>();
const archivedCallouts = ref<Paginated<CalloutCardData>>();

const archivedTotal = ref<number>();

const archiveTotalPages = computed(() =>
  archivedCallouts.value
    ? Math.ceil(archivedCallouts.value.total / archivePageSize)
    : 0
);
watch(archiveTotalPages, (value) => {
  if (archivePage.value > value) {
    archivePage.value = Math.max(0, value - 1);
  }
});

onBeforeMount(async () => {
  activeCallouts.value = await client.callout.list(
    {
      sort: 'starts',
      order: 'DESC',
      rules: {
        condition: 'AND',
        rules: [
          { field: 'status', operator: 'equal', value: [ItemStatus.Open] },
          { field: 'hidden', operator: 'equal', value: [false] },
        ],
      },
    },
    calloutWiths
  );

  const archived = await client.callout.list({
    limit: 1,
    rules: {
      condition: 'AND',
      rules: [
        { field: 'status', operator: 'equal', value: [ItemStatus.Ended] },
        { field: 'hidden', operator: 'equal', value: [false] },
      ],
    },
  });
  archivedTotal.value = archived.total;
});

watchEffect(async () => {
  const query: GetCalloutsQuery = {
    offset: archivePage.value * archivePageSize,
    limit: archivePageSize,
    sort: 'expires',
    order: 'DESC',
    rules: {
      condition: 'AND',
      rules: [
        {
          field: 'title',
          operator: 'contains',
          value: [archiveSearch.value],
        },
        { field: 'hidden', operator: 'equal', value: [false] },
        { field: 'status', operator: 'equal', value: [ItemStatus.Ended] },
        ...(archiveRespondedOnly.value
          ? [
              {
                field: 'answeredBy' as const,
                operator: 'equal' as const,
                value: ['me'],
              },
            ]
          : []),
      ],
    },
  };

  archivedCallouts.value = await client.callout.list(query, calloutWiths);
});
</script>
