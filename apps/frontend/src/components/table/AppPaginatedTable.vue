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
        v-model:page="currentPage"
        v-model:limit="currentLimit"
        :result="result"
        class="ml-auto items-end"
        no-limit
      />
    </div>
    <div class="overflow-x-auto">
      <AppTable
        v-model:sort="currentSort"
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
      v-model:page="currentPage"
      v-model:limit="currentLimit"
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

const emit = defineEmits<{
  'update:query': [query: { page: number; limit: number; sort?: Sort }];
}>();

// Computed properties for v-model compatibility
const currentPage = computed({
  get: () => props.query.page,
  set: (page: number) => emit('update:query', { ...props.query, page }),
});

const currentLimit = computed({
  get: () => props.query.limit,
  set: (limit: number) => emit('update:query', { ...props.query, limit }),
});

const currentSort = computed({
  get: () => props.query.sort,
  set: (sort: Sort | undefined) =>
    emit('update:query', { ...props.query, sort }),
});

// Slots are passed to AppTable, typing is handled by Vue's inference
const slotNames = computed(() => {
  const slots = useSlots();
  return Object.keys(slots).filter((name) => name !== 'actions');
});
</script>
