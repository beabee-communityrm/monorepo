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

/**
 * @param selectionState - Existing state to work on, so a page and its table
 * can share one selection; a new one is created if omitted
 */
export function useSelectionState<I extends { id: string }>(
  items: Ref<I[]> | ComputedRef<I[]>,
  totalItemCount: Ref<number>,
  selectionState: Ref<SelectionState> = ref({ mode: 'explicit', ids: [] })
) {
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

  /** Writes the selection once, as a shared v-model only updates on render */
  function setSelected(ids: string[], selected: boolean) {
    const state = selectionState.value;
    const without = (list: string[]) => list.filter((id) => !ids.includes(id));
    if (state.mode === 'all') {
      selectionState.value = {
        mode: 'all',
        excludedIds: selected
          ? without(state.excludedIds)
          : [...without(state.excludedIds), ...ids],
      };
    } else {
      selectionState.value = {
        mode: 'explicit',
        ids: selected ? [...without(state.ids), ...ids] : without(state.ids),
      };
    }
  }

  function toggleAllOnPage() {
    setSelected(
      items.value.map((item) => item.id),
      !allOnPageSelected.value
    );
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
