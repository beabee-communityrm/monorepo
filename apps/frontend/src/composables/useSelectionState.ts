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

  const allOnPageSelected = computed(
    () =>
      items.value.length > 0 &&
      selectedPageItems.value.length === items.value.length
  );

  const someOnPageSelected = computed(
    () => selectedPageItems.value.length > 0 && !allOnPageSelected.value
  );

  function setSelected(id: string, selected: boolean) {
    const state = selectionState.value;
    if (state.mode === 'all') {
      selectionState.value = {
        mode: 'all',
        excludedIds: selected
          ? state.excludedIds.filter((x) => x !== id)
          : [...state.excludedIds, id],
      };
    } else {
      selectionState.value = {
        mode: 'explicit',
        ids: selected ? [...state.ids, id] : state.ids.filter((x) => x !== id),
      };
    }
  }

  function toggleAllOnPage() {
    const selected = !allOnPageSelected.value;
    for (const item of items.value) {
      if (isSelected(item.id) !== selected) setSelected(item.id, selected);
    }
  }

  /** Extends the selection to every item matching the current filters */
  function selectAllMatching() {
    selectionState.value = { mode: 'all', excludedIds: [] };
  }

  function clearSelection() {
    selectionState.value = { mode: 'explicit', ids: [] };
  }

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
    allOnPageSelected,
    someOnPageSelected,
    isSelected,
    setSelected,
    toggleAllOnPage,
    selectAllMatching,
    clearSelection,
    getSelectionRules,
  };
}
