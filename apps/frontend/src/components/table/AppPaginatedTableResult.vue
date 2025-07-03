<!--
  # AppPaginatedTableResult
  A component that displays pagination information and controls for paginated tables.

  Uses internal i18n for pagination text:
  - Showing text: common.showingOf
  - Page count text: common.pageCount
  - Items per page text: common.itemsPerPage

  ## Features:
  - Shows current page range and total results
  - Page size selector (optional)
  - Pagination controls
  - Responsive design
  - Accessible with proper labeling

  ## Props:
  - `page`: Current page number (0-based)
  - `limit`: Items per page
  - `result`: Paginated result data
  - `noLimit`: Hide the items per page selector

  ## Events:
  - `update:page`: Emitted when page changes
  - `update:limit`: Emitted when limit changes
-->
<template>
  <div v-if="result" class="flex flex-col items-end md:flex-row md:gap-4">
    <p class="mb-3 text-sm md:mb-0 md:flex-1">
      <span v-if="result.count > 0" v-html="formattedShowingText" />
    </p>

    <div v-if="!noLimit || totalPages > 1" class="flex gap-2">
      <template v-if="!noLimit">
        <p class="flex-1 self-center text-sm">
          <span v-if="result.count > 0" v-html="formattedPageCountText" />
        </p>
        <AppSelect v-model="currentLimit" :items="limits" />
      </template>
      <AppPagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * Pagination information and controls component
 *
 * Uses internal i18n for pagination text:
 * - Showing text: common.showingOf
 * - Page count text: common.pageCount
 * - Items per page text: common.itemsPerPage
 *
 * @component AppPaginatedTableResult
 */
import { AppSelect } from '@beabee/vue';
import { AppPagination } from '@beabee/vue';

import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Paginated } from '../../type/paginated';

const { t } = useI18n();

/**
 * Props for the AppPaginatedTableResult component
 */
export interface AppPaginatedTableResultProps {
  /** Current page number (0-based) */
  page: number;
  /** Items per page */
  limit: number;
  /** Paginated result data */
  result: Paginated<unknown> | undefined;
  /** Hide the items per page selector */
  noLimit?: boolean;
  /** Number formatter function */
  formatNumber?: (value: number) => string;
}

const props = withDefaults(defineProps<AppPaginatedTableResultProps>(), {
  noLimit: false,
  formatNumber: (value: number) => value.toLocaleString(),
});

/**
 * Events emitted by the AppPaginatedTableResult component
 */
const emit = defineEmits<{
  /**
   * Emitted when the page changes
   * @param page - The new page number
   */
  'update:page': [page: number];
  /**
   * Emitted when the limit changes
   * @param limit - The new limit
   */
  'update:limit': [limit: number];
}>();

// Computed properties
const currentPage = computed({
  get: () => props.page,
  set: (newPage) => emit('update:page', newPage),
});

const currentLimit = computed({
  get: () => props.limit,
  set: (newLimit) => emit('update:limit', newLimit),
});

const limits = computed(() =>
  [12, 25, 50, 100].map((x) => ({
    id: x,
    label: t('common.itemsPerPage').replace('{items}', props.formatNumber(x)),
  }))
);

const totalPages = computed(() =>
  props.result ? Math.ceil(props.result.total / currentLimit.value) : 0
);

const formattedShowingText = computed(() => {
  if (!props.result || props.result.count === 0) return '';

  return t('common.showingOf')
    .replace('{start}', props.formatNumber(props.result.offset + 1))
    .replace(
      '{end}',
      props.formatNumber(props.result.offset + props.result.count)
    )
    .replace('{total}', props.formatNumber(props.result.total));
});

const formattedPageCountText = computed(() => {
  if (!props.result || props.result.count === 0) return '';

  return t('common.pageCount')
    .replace('{pageNumber}', props.formatNumber(props.page + 1))
    .replace('{pageTotal}', props.formatNumber(totalPages.value));
});

// Watch for total pages changes and adjust current page if needed
watch(totalPages, () => {
  if (currentPage.value > totalPages.value - 1) {
    currentPage.value = Math.max(0, totalPages.value - 1);
  }
});
</script>
