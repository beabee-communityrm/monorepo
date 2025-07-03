<!--
  # AppPaginatedTable
  A wrapper component that combines AppTable with pagination controls.

  ## Features:
  - Integrates table display with pagination
  - Flexible slot system inherited from AppTable
  - Responsive design
  - Action slots for custom controls
  - Supports all AppTable features

  ## Props:
  - `headers`: Array of column definitions
  - `result`: Paginated result data
  - `query`: Query object with page, limit, and sort
  - `selectable`: Enable row selection
  - `rowClass`: Function to add custom row classes
  - `formatNumber`: Number formatter function

  ## Events:
  - Inherits all events from AppTable and AppPaginatedTableResult

  ## Slots:
  - `actions`: Custom action controls
  - All slots from AppTable
-->
<template>
  <div>
    <div class="mb-2 flex items-end gap-4">
      <slot name="actions"></slot>
      <AppPaginatedTableResult
        :page="query.page"
        :limit="query.limit"
        :result="result"
        :format-number="formatNumber"
        class="ml-auto items-end"
        no-limit
        @update:page="updatePage"
        @update:limit="updateLimit"
      />
    </div>
    <div class="overflow-x-auto">
      <AppTable
        :sort="query.sort"
        :headers="headers"
        :items="result?.items || null"
        :selectable="selectable"
        :row-class="rowClass"
        class="mb-4 w-full"
        @update:sort="updateSort"
      >
        <template v-for="name of slotNames" #[name]="slotData" :key="name">
          <!-- eslint-disable-next-line @typescript-eslint/no-explicit-any -->
          <slot :name="name as any" v-bind="(slotData || {}) as any"></slot>
        </template>
      </AppTable>
    </div>
    <AppPaginatedTableResult
      :page="query.page"
      :limit="query.limit"
      :result="result"
      :format-number="formatNumber"
      class="items-center"
      @update:page="updatePage"
      @update:limit="updateLimit"
    />
  </div>
</template>

<script lang="ts" setup generic="I extends Item">
/**
 * Paginated table component combining table display with pagination controls
 *
 * @component AppPaginatedTable
 */
import { AppTable } from '@beabee/vue';

import { computed, useSlots } from 'vue';

import { type Paginated } from '../../type/paginated';
import { type Header, type Item, type Sort } from '../../type/table';
import AppPaginatedTableResult from './AppPaginatedTableResult.vue';

/**
 * Props for the AppPaginatedTable component
 */
export interface AppPaginatedTableProps<I extends Item> {
  /** Array of column definitions */
  headers: Header[];
  /** Paginated result data */
  result: Paginated<I> | undefined;
  /** Query object containing pagination and sort state */
  query: {
    /** Current page number (0-based) */
    page: number;
    /** Items per page */
    limit: number;
    /** Current sort configuration */
    sort?: Sort;
  };
  /** Enable row selection with checkboxes */
  selectable?: boolean;
  /** Function to add custom CSS classes to rows */
  rowClass?: (item: I) => string;
  /** Number formatter function */
  formatNumber?: (value: number) => string;
}

const props = withDefaults(defineProps<AppPaginatedTableProps<I>>(), {
  selectable: false,
  rowClass: undefined,
  formatNumber: (value: number) => value.toLocaleString(),
});

/**
 * Events emitted by the AppPaginatedTable component
 */
const emit = defineEmits<{
  'update:query': [query: { page: number; limit: number; sort?: Sort }];
}>();

/**
 * Update page number
 */
function updatePage(page: number) {
  emit('update:query', { ...props.query, page });
}

/**
 * Update items per page limit
 */
function updateLimit(limit: number) {
  emit('update:query', { ...props.query, limit });
}

/**
 * Update sort configuration
 */
function updateSort(sort: Sort) {
  emit('update:query', { ...props.query, sort });
}

// Slots are passed to AppTable, typing is currently lost
const slotNames = computed<string[]>(() => {
  const slots = useSlots();
  return Object.keys(slots).filter((name) => name !== 'actions');
});

/**
 * Slots available in the AppPaginatedTable component
 */
defineSlots<
  {
    /**
     * Custom action controls displayed above the table
     */
    actions: () => unknown;
    /**
     * Additional content displayed after each row
     * @param item - The row item
     */
    after: (props: { item: I }) => unknown;
    /**
     * Custom empty state content
     */
    empty: () => unknown;
    /**
     * Custom loading state content
     */
    loading: () => unknown;
  } & {
    /**
     * Custom content for a specific header
     * @param header - The header configuration
     */
    [K in `header-${string}`]: (props: { header: Header }) => unknown;
  } & {
    /**
     * Custom content for a specific cell value
     * @param item - The row item
     * @param value - The cell value
     */
    [K in `value-${string}`]: (props: { item: I; value: unknown }) => unknown;
  }
>();
</script>
