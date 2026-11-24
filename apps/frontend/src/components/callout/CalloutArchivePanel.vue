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
            <USkeleton v-if="totalSkeleton" as="span" class="h-5 w-6" />
            <UBadge
              v-else-if="archivedTotal !== undefined"
              color="neutral"
              variant="subtle"
              size="sm"
            >
              {{ archivedTotal }}
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

      <LoadError
        v-if="listFailed"
        :retry="retryList"
        class="border-t border-default p-4"
      />

      <div
        v-else-if="listSkeleton"
        class="divide-y divide-default border-t border-default"
      >
        <div v-for="n in 2" :key="n" class="space-y-2 p-3">
          <USkeleton class="h-4 w-1/2" />
          <USkeleton class="h-4 w-1/3" />
        </div>
      </div>

      <div
        v-else-if="archivedCallouts?.items.length"
        class="divide-y divide-default border-t border-default"
      >
        <CalloutArchiveRow
          v-for="callout in archivedCallouts.items"
          :key="callout.slug"
          :callout="callout"
        />
      </div>
      <p
        v-else-if="archivedCallouts"
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
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import CalloutArchiveRow from '#components/callout/CalloutArchiveRow.vue';
import LoadError from '#components/LoadError.vue';
import {
  archiveParams,
  archivePageSize,
  archivedCalloutsQuery,
  archivedTotalQuery,
} from '#components/pages/callouts/use-callout-list';
import { useLazyQuery } from '#composables/useLazyQuery';
import { defineParam } from '#utils/pagination';

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

const route = useRoute();

const { data: archivedTotal, skeleton: totalSkeleton } =
  useLazyQuery(archivedTotalQuery);

const {
  data: archivedCallouts,
  skeleton: listSkeleton,
  failed: listFailed,
  retry: retryList,
} = useLazyQuery(() => archivedCalloutsQuery(archiveParams(route.query)));

const archiveTotalPages = computed(() =>
  archivedCallouts.value
    ? Math.ceil(archivedCallouts.value.total / archivePageSize)
    : 0
);
watch(
  archiveTotalPages,
  (value) => {
    if (archivedCallouts.value && archivePage.value > value) {
      archivePage.value = Math.max(0, value - 1);
    }
  },
  { immediate: true }
);
</script>
