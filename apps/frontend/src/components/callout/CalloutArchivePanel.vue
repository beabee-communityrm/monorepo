<template>
  <UCard :ui="{ root: 'divide-y-0', header: 'p-0 sm:p-0', body: 'p-0 sm:p-0' }">
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
            class="flex items-center gap-2 text-base font-semibold text-highlighted"
          >
            <UIcon name="i-lucide-archive" class="size-4 text-muted" />
            {{ t('callouts.archive') }}
            <UBadge color="neutral" variant="subtle" size="sm">
              {{ archivedTotal ?? 0 }}
            </UBadge>
          </span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-4 text-muted transition-transform"
            :class="archiveOpen && 'rotate-180'"
          />
        </UButton>
      </h2>
    </template>

    <template v-if="archiveOpen">
      <div
        class="flex flex-wrap items-center gap-3 border-t border-default p-4"
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
          :aria-pressed="!!archiveAnsweredOnly"
          :color="archiveAnsweredOnly ? 'primary' : 'neutral'"
          :variant="archiveAnsweredOnly ? 'subtle' : 'outline'"
          class="shrink-0"
          @click="toggleArchiveAnsweredOnly"
        >
          <UIcon
            name="i-lucide-check"
            aria-hidden="true"
            class="size-3.5 transition-opacity"
            :class="archiveAnsweredOnly ? 'opacity-100' : 'opacity-40'"
          />
          {{ t('callouts.showAnswered') }}
        </UButton>
      </div>

      <div
        v-if="archivedCallouts && archivedCallouts.items.length > 0"
        class="divide-y divide-default border-t border-default"
      >
        <CalloutArchiveRow
          v-for="callout in archivedCallouts.items"
          :key="callout.slug"
          :callout="callout"
        />
      </div>
      <p
        v-else
        class="border-t border-default px-4 py-8 text-center text-muted"
      >
        {{ t('callouts.noArchivedCallouts') }}
      </p>

      <div
        v-if="archiveTotalPages > 1"
        class="flex items-center justify-between border-t border-default p-4"
      >
        <span class="text-sm text-muted">
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
import { client } from '#utils/api';
import { defineParam } from '#utils/pagination';
import type { CalloutCardData } from '#type';

const { t } = useI18n();

const archiveSearch = defineParam('s', (v) => v || '');
const archiveSearchInput = ref(archiveSearch.value);
const archiveAnsweredOnly = defineParam('show', (v) =>
  v === 'answered' ? v : ''
);
const archivePage = defineParam('page', (v) => Number(v) || 0);
const archiveOpen = ref(false);

function toggleArchive() {
  archiveOpen.value = !archiveOpen.value;
}

function toggleArchiveAnsweredOnly() {
  archiveAnsweredOnly.value = archiveAnsweredOnly.value ? '' : 'answered';
}

function clearArchiveSearch() {
  archiveSearchInput.value = '';
  archiveSearch.value = '';
}

const archivePageSize = 10;

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
        ...(archiveAnsweredOnly.value
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

  archivedCallouts.value = await client.callout.list(query, [
    'hasAnswered',
    'responseCount',
  ]);
});
</script>
