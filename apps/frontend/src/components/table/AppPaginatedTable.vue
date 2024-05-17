<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <div class="mb-2 flex items-end gap-4">
      <slot name="actions"></slot>
      <AppPaginatedTableResult
        v-model:page="query.page"
        v-model:limit="query.limit"
        :keypath="keypath"
        :result="result"
        class="ml-auto items-end"
        no-limit
      />
    </div>
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
    <AppPaginatedTableResult
      v-model:page="query.page"
      v-model:limit="query.limit"
      :keypath="keypath"
      :result="result"
      class="items-center"
    />
  </div>
</template>

<script lang="ts" setup generic="I extends Item">
import { type Paginated } from '@beabee/beabee-common';
import AppPaginatedTableResult from './AppPaginatedTableResult.vue';
import AppTable from './AppTable.vue';
import { type Header, type Item, SortType } from './table.interface';
import { computed, useSlots } from 'vue';

defineProps<{
  headers: Header[];
  keypath: string;
  result: Paginated<I> | undefined;
  query: {
    page: number;
    limit: number;
    sort?: {
      by: string;
      type: SortType;
    };
  };
  selectable?: boolean;
  rowClass?: (item: I) => string;
}>();

// Slots are passed to AppTable, typing is currently lost
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const slotNames = computed<any[]>(() => {
  const slots = useSlots();
  return Object.keys(slots);
});
</script>
