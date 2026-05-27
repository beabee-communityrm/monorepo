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
        v-model:mode="selection.bannerMode.value"
        :page-selected-count="selection.pageSelectedIds.value.length"
        :total="props.totalItems"
        @select-all-global="selection.selectAllGlobal"
        @clear-selection="selection.clearSelection"
      />
      <AppTable
        v-model:sort="query.sort"
        :headers="headers"
        :items="result?.items ?? null"
        :selectable="selectable"
        :row-class="rowClass"
        :selection-state="selection.pageSelectionState.value"
        :selected-ids="selection.pageSelectedIds.value"
        class="mb-4 w-full"
        @toggle-select="selection.setSelection"
        @toggle-select-all="selection.setPageSelection"
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
import type { SelectionState } from '#composables/useSelectionState';
import { usePaginatedTableSelection } from '../../composables/usePaginatedTableSelection';

const props = defineProps<{
  headers: Header[];
  result: Paginated<I> | undefined;
  query: {
    page: number;
    limit: number;
    sort?: Sort;
  };
  selectionState: SelectionState;
  selectable?: boolean;
  rowClass?: (item: I) => string;
  totalItems: number;
}>();

const emit = defineEmits<{
  'update:selectionState': [SelectionState];
}>();

const selectionStateModel = computed({
  get: () => props.selectionState,
  set: (value: SelectionState) => emit('update:selectionState', value),
});

const selection = usePaginatedTableSelection<I>({
  selectable: props.selectable,
  selectionState: selectionStateModel,
  items: computed(() => props.result?.items ?? []),
  totalItems: computed(() => props.totalItems),
  limit: computed(() => props.query.limit),
});

// Slots are passed to AppTable, typing is handled by Vue's inference
const slotNames = computed(() => {
  const slots = useSlots();
  return Object.keys(slots).filter((name) => name !== 'actions');
});
</script>
