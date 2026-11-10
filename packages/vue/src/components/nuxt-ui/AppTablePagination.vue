<!--
  # AppTablePagination
  Pagination footer for tables and paginated lists.

  Shows which items are on screen ("1–25 of 50") and a rows-per-page selector
  on the left, with the page controls on the right. A fixed `pageSize` hides
  the selector.

  ## Internal i18n usage
  - common.range-nuxt: "{start}–{end} of {total}"
  - common.rowsPerPage-nuxt: "rows per page"
-->
<template>
  <div
    class="flex flex-wrap items-center justify-between gap-3 border-t border-default p-4"
  >
    <span class="flex items-center gap-2 text-muted">
      <span>
        {{
          t('common.range-nuxt', {
            start: n(rangeStart),
            end: n(rangeEnd),
            total: n(total),
          })
        }}
      </span>

      <template v-if="!pageSize">
        <span class="h-4 w-px bg-accented" aria-hidden="true" />
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
  /** Fixed page size, which hides the rows-per-page selector */
  pageSize?: number;
}

const props = defineProps<AppTablePaginationProps>();

/** Current page, zero-based */
const page = defineModel<number>('page', { required: true });
/** Rows per page, only used without a fixed `pageSize` */
const limit = defineModel<number>('limit', { default: 25 });

const limitOptions = [12, 25, 50, 100];

const itemsPerPage = computed(() => props.pageSize ?? limit.value);

const rangeStart = computed(() =>
  props.total ? page.value * itemsPerPage.value + 1 : 0
);
const rangeEnd = computed(() =>
  Math.min((page.value + 1) * itemsPerPage.value, props.total)
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.total / itemsPerPage.value))
);

watch([totalPages, () => props.total], () => {
  if (page.value > totalPages.value - 1) {
    page.value = Math.max(0, totalPages.value - 1);
  }
});
</script>
