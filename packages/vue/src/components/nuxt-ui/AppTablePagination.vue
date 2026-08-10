<!--
  # AppTablePagination
  Pagination footer for tables and paginated lists.

  Shows the current page — and optionally a rows-per-page selector — on the
  left, with the page controls on the right.

  ## Internal i18n usage
  - common.pageCount-nuxt: "Page {pageNumber} of {pageTotal}"
  - common.rowsPerPage-nuxt: "rows per page"
-->
<template>
  <div
    class="border-default flex flex-wrap items-center justify-between gap-3 border-t p-4"
  >
    <span class="text-muted flex items-center gap-2">
      <i18n-t keypath="common.pageCount-nuxt" tag="span">
        <template #pageNumber>
          <b class="text-highlighted font-medium">{{ n(page + 1) }}</b>
        </template>
        <template #pageTotal>
          <b class="text-highlighted font-medium">{{ n(totalPages) }}</b>
        </template>
      </i18n-t>

      <template v-if="limitOptions">
        <span class="bg-accented h-4 w-px" aria-hidden="true" />
        <USelect
          v-model="limit"
          :items="limitOptions"
          :aria-label="t('common.rowsPerPage-nuxt')"
        />
        <span>{{ t('common.rowsPerPage-nuxt') }}</span>
      </template>
    </span>

    <UPagination
      variant="subtle"
      :page="page + 1"
      :total="total"
      :items-per-page="itemsPerPage"
      @update:page="(newPage: number) => (page = newPage - 1)"
    />
  </div>
</template>

<script lang="ts" setup>
/**
 * Pagination footer for tables and paginated lists.
 *
 * @component AppTablePagination
 */
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, n } = useI18n();

export interface AppTablePaginationProps {
  /** Total number of items across all pages */
  total: number;
  /** Rows per page options, omit to hide the selector */
  limitOptions?: number[];
  /** Fixed page size, only used when there is no rows-per-page selector */
  pageSize?: number;
}

const props = defineProps<AppTablePaginationProps>();

/** Current page, zero-based */
const page = defineModel<number>('page', { required: true });
/** Rows per page, only used when `limitOptions` is set */
const limit = defineModel<number>('limit', { default: 25 });

const itemsPerPage = computed(() =>
  props.limitOptions ? limit.value : (props.pageSize ?? limit.value)
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / itemsPerPage.value))
);

watch(totalPages, () => {
  if (page.value > totalPages.value - 1) {
    page.value = Math.max(0, totalPages.value - 1);
  }
});
</script>
