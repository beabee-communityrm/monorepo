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
        v-model:page="query.page"
        v-model:limit="query.limit"
        :result="result"
        class="ml-auto items-end"
        no-limit
      />
    </div>
    <div class="overflow-x-auto">
      <AppTable
        v-model:sort="query.sort"
        :headers="headers"
        :items="result?.items || null"
        :selectable="selectable"
        :row-class="rowClass"
        class="mb-4 w-full"
      >
        <template v-for="name of slotNames" #[name]="slotData" :key="name">
          <slot :name="name" v-bind="slotData || {}"></slot>
        </template>
      </AppTable>
    </div>
    <AppPaginatedTableResult
      v-model:page="query.page"
      v-model:limit="query.limit"
      :result="result"
      class="items-center"
    />
  </div>
</template>

<script lang="ts" setup generic="I extends Item">
/**
 * Paginated table component combining table display with pagination controls
 *
 * @component AppPaginatedTable
 */
import { type Paginated } from '@beabee/beabee-common';

import { computed, useSlots } from 'vue';

import { type Header, type Item, type Sort } from '../../types/table';
import AppPaginatedTableResult from './AppPaginatedTableResult.vue';
import AppTable from './AppTable.vue';

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
}

const props = withDefaults(defineProps<AppPaginatedTableProps<I>>(), {
  selectable: false,
  rowClass: undefined,
});

// Slots are passed to AppTable, typing is currently lost
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const slotNames = computed<any[]>(() => {
  const slots = useSlots();
  return Object.keys(slots);
});

/**
 * Slots available in the AppPaginatedTable component
 */
defineSlots<
  {
    /**
     * Custom action controls displayed above the table
     */
    actions: () => any;
    /**
     * Additional content displayed after each row
     * @param item - The row item
     */
    after: (props: { item: I }) => any;
    /**
     * Custom empty state content
     */
    empty: () => any;
    /**
     * Custom loading state content
     */
    loading: () => any;
  } & {
    /**
     * Custom content for a specific header
     * @param header - The header configuration
     */
    [K in `header-${string}`]: (props: { header: Header }) => any;
  } & {
    /**
     * Custom content for a specific cell value
     * @param item - The row item
     * @param value - The cell value
     */
    [K in `value-${string}`]: (props: { item: I; value: any }) => any;
  }
>();
</script>
