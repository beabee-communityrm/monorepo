<!--
  # AppTablePagination
  Pagination footer for tables and paginated lists.

  Shows the current page and a rows-per-page selector on the left, with the
  page controls on the right.

  ## Internal i18n usage
  - common.pageCount-nuxt: "Page {pageNumber} of {pageTotal}"
  - common.rowsPerPage-nuxt: "rows per page"
-->
<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-t border-default p-4"
  >
    <span class="flex items-center gap-2 text-muted">
      <i18n-t keypath="common.pageCount-nuxt" tag="span">
        <template #pageNumber>
          <b class="font-medium text-highlighted">{{ n(page + 1) }}</b>
        </template>
        <template #pageTotal>
          <b class="font-medium text-highlighted">{{ n(totalPages) }}</b>
        </template>
      </i18n-t>

      <span class="h-4 w-px bg-accented" aria-hidden="true" />
      <USelect
        v-model="limit"
        :items="limitOptions"
        :aria-label="t('common.rowsPerPage-nuxt')"
      />
      <span>{{ t('common.rowsPerPage-nuxt') }}</span>
    </span>

    <UPagination
      variant="subtle"
      :page="page + 1"
      :total="total"
      :items-per-page="limit"
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
}

const props = defineProps<AppTablePaginationProps>();

/** Current page, zero-based */
const page = defineModel<number>('page', { required: true });
/** Rows per page */
const limit = defineModel<number>('limit', { default: 25 });

const limitOptions = [12, 25, 50, 100];

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / limit.value))
);

watch(totalPages, () => {
  if (page.value > totalPages.value - 1) {
    page.value = Math.max(0, totalPages.value - 1);
  }
});
</script>
