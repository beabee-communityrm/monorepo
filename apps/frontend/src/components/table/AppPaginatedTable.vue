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
        v-if="showSelectAllBanner"
        v-model:mode="mode"
        :page-selected-count="selectedIds.length"
        :total-table-items="result?.total ?? 0"
      />
      <AppTable
        v-model:sort="query.sort"
        v-model:selected-ids="selectedIds"
        :headers="headers"
        :items="result?.items ?? null"
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
import { AppTable } from '@beabee/vue';

import { computed, useSlots } from 'vue';

import { type Paginated } from '../../type/paginated';
import { type Header, type Item, type Sort } from '../../type/table';
import AppPaginatedTableResult from './AppPaginatedTableResult.vue';
import SelectAllBanner from './SelectAllBanner.vue';
import type { SelectionState } from '../../type/selection-state';

const props = defineProps<{
  headers: Header[];
  result: Paginated<I> | undefined;
  query: {
    page: number;
    limit: number;
    sort?: Sort;
  };
  selectable?: boolean;
  rowClass?: (item: I) => string;
}>();

const selectionState = defineModel<SelectionState>('selectionState', {
  required: false,
  default: () => ({
    mode: 'explicit',
    ids: [],
  }),
});

const mode = computed({
  get: () => selectionState.value.mode,
  set: (val) => {
    if (val === 'all') {
      selectionState.value = {
        mode: 'all',
        excludedIds: [],
      };
    } else {
      selectionState.value = {
        mode: 'explicit',
        ids: [],
      };
    }
  },
});

const allIdsOnPage = computed(
  () => props.result?.items?.map((i) => i.id) || []
);

const selectedIds = computed({
  get: () => {
    if (selectionState.value.mode === 'all') {
      const excludedIds = selectionState.value.excludedIds;
      return allIdsOnPage.value.filter((id) => !excludedIds.includes(id));
    } else {
      const ids = selectionState.value.ids;
      return allIdsOnPage.value.filter((id) => ids.includes(id));
    }
  },
  set: (newSelectedIds) => {
    // Preserves selections/exclusions from other pages and only replaces
    // the selection state for IDs on the current page
    if (selectionState.value.mode === 'all') {
      const newExcludedIds = allIdsOnPage.value.filter(
        (id) => !newSelectedIds.includes(id)
      );
      const otherExcludedIds = selectionState.value.excludedIds.filter(
        (id) => !allIdsOnPage.value.includes(id)
      );
      selectionState.value = {
        mode: 'all',
        excludedIds: [...otherExcludedIds, ...newExcludedIds],
      };
    } else {
      const otherSelectedIds = selectionState.value.ids.filter(
        (id) => !allIdsOnPage.value.includes(id)
      );
      selectionState.value = {
        mode: 'explicit',
        ids: [...otherSelectedIds, ...newSelectedIds],
      };
    }
  },
});

const showSelectAllBanner = computed(() => {
  if (selectionState.value.mode === 'all') {
    return selectionState.value.excludedIds.length === 0;
  }

  const allOnPageSelected =
    allIdsOnPage.value.length === selectedIds.value.length;

  const isSinglePage = props.result
    ? props.result.total <= props.result.count
    : false;

  return allOnPageSelected && !isSinglePage;
});

// Slots are passed to AppTable, typing is handled by Vue's inference
const slotNames = computed(() => {
  const slots = useSlots();
  return Object.keys(slots).filter((name) => name !== 'actions');
});
</script>
