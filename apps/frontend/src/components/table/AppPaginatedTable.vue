<!-- eslint-disable vue/no-mutating-props -->
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
      <SelectAllBanner
        v-if="showSelectAllBanner || showClearSelectionBanner"
        :show-select-all-banner="showSelectAllBanner"
        :show-clear-selection-banner="showClearSelectionBanner"
        :total="totalItems"
        :page-selected-count="pageSelectedCount"
        :selected-count="selectedCount"
        @select-all-matching="emit('select-all-matching')"
        @clear-selection="emit('clear-selection')"
      />
      <AppTable
        v-model:sort="query.sort"
        :selected-ids="selectedIds"
        :headers="headers"
        :items="result?.items || null"
        :selectable="selectable"
        :row-class="rowClass"
        :selection-state="selectionState"
        @toggle-select="(id, selected) => emit('toggle-select', id, selected)"
        @toggle-select-all="(selected) => emit('toggle-select-all', selected)"
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
import { AppTable } from '@beabee/vue';

import { computed, useSlots } from 'vue';

import { type Paginated } from '../../type/paginated';
import { type Header, type Item, type Sort } from '../../type/table';
import AppPaginatedTableResult from './AppPaginatedTableResult.vue';
import SelectAllBanner from './SelectAllBanner.vue';

defineProps<{
  headers: Header[];
  result: Paginated<I> | undefined;
  query: {
    page: number;
    limit: number;
    sort?: Sort;
  };
  selectedIds?: string[];
  selectionState?: 'none' | 'partial' | 'all';
  selectable?: boolean;
  rowClass?: (item: I) => string;
  showSelectAllBanner?: boolean;
  showClearSelectionBanner?: boolean;
  selectedCount: number;
  pageSelectedCount: number;
  totalItems: number;
}>();

const emit = defineEmits<{
  'toggle-select': [id: string, selected: boolean];
  'toggle-select-all': [selected: boolean];
  'select-all-matching': [];
  'clear-selection': [];
}>();

// Slots are passed to AppTable, typing is handled by Vue's inference
const slotNames = computed(() => {
  const slots = useSlots();
  return Object.keys(slots).filter((name) => name !== 'actions');
});
</script>
