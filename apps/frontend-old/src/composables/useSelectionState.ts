import type { RuleGroup } from '@beabee/beabee-common';

import { type ComputedRef, type Ref, computed, ref } from 'vue';

import type { Paginated } from '../type/paginated';
import type { SelectionState } from '../type/selection-state';

export function usePaginatedSelectionState<I extends { id: string }>(
  table: Ref<Paginated<I> | undefined>
) {
  return useSelectionState(
    computed(() => table.value?.items ?? []),
    computed(() => table.value?.total ?? 0)
  );
}

export function useSelectionState<I extends { id: string }>(
  items: Ref<I[]> | ComputedRef<I[]>,
  totalItemCount: Ref<number>
) {
  const selectionState = ref<SelectionState>({
    mode: 'explicit',
    ids: [],
  });

  function isSelected(id: string): boolean {
    switch (selectionState.value.mode) {
      case 'explicit':
        return selectionState.value.ids.includes(id);
      case 'all':
        return !selectionState.value.excludedIds.includes(id);
    }
  }

  function getSelectionRules(): RuleGroup {
    switch (selectionState.value.mode) {
      case 'explicit':
        return {
          condition: 'OR',
          rules: selectionState.value.ids.map((id) => ({
            field: 'id',
            operator: 'equal',
            value: [id],
          })),
        };
      case 'all':
        return {
          condition: 'AND',
          rules: selectionState.value.excludedIds.map((id) => ({
            field: 'id',
            operator: 'not_equal',
            value: [id],
          })),
        };
    }
  }

  const selectedPageItems = computed(() =>
    items.value.filter((item) => isSelected(item.id))
  );

  const selectedCount = computed(() => {
    switch (selectionState.value.mode) {
      case 'explicit':
        return selectionState.value.ids.length;
      case 'all':
        return totalItemCount.value - selectionState.value.excludedIds.length;
      default:
        return 0;
    }
  });

  return {
    selectionState,
    selectedPageItems,
    selectedCount,
    isSelected,
    getSelectionRules,
  };
}
