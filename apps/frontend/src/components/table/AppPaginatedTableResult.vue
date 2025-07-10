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
      <i18n-t v-if="result.count > 0" keypath="common.showingOf">
        <template #start
          ><b>{{ n(result.offset + 1) }}</b></template
        >
        <template #end
          ><b>{{ n(result.offset + result.count) }}</b></template
        >
        <template #total
          ><b>{{ n(result.total) }}</b></template
        >
      </i18n-t>
    </p>

    <div v-if="!noLimit || totalPages > 1" class="flex gap-2">
      <template v-if="!noLimit">
        <p class="flex-1 self-center text-sm">
          <i18n-t v-if="result.count > 0" keypath="common.pageCount">
            <template #pageNumber
              ><b>{{ n(props.page + 1) }}</b></template
            >
            <template #pageTotal
              ><b>{{ n(totalPages) }}</b></template
            >
          </i18n-t>
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
import type { Paginated } from '@beabee/beabee-common';
import { AppPagination, AppSelect } from '@beabee/vue';

import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

export interface AppPaginatedTableResultProps {
  /** Current page number (0-based) */
  page: number;
  /** Items per page */
  limit: number;
  /** Paginated result data */
  result: Paginated<unknown> | undefined;
  /** Hide the items per page selector */
  noLimit?: boolean;
}

const props = withDefaults(defineProps<AppPaginatedTableResultProps>(), {
  noLimit: false,
});

const emit = defineEmits<{
  'update:page': [page: number];
  'update:limit': [limit: number];
}>();
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
    label: t('common.itemsPerPage', { items: n(x) }),
  }))
);

const totalPages = computed(() =>
  props.result ? Math.ceil(props.result.total / currentLimit.value) : 0
);

// Watch for total pages changes and adjust current page if needed
watch(totalPages, () => {
  if (currentPage.value > totalPages.value - 1) {
    currentPage.value = Math.max(0, totalPages.value - 1);
  }
});
</script>
