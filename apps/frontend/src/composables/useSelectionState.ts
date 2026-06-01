import type { RuleGroup } from '@beabee/beabee-common';

import { type Ref, computed, ref } from 'vue';

export type SelectionState =
  | { mode: 'explicit'; ids: string[] }
  | { mode: 'all'; excludedIds: string[] };

export type PageSelectionState = 'none' | 'partial' | 'all';

export function useSelectionState(itemCount: Ref<number>) {
  const selectionState = ref<SelectionState>({
    mode: 'explicit',
    ids: [],
  });

  function isSelected(id: string): boolean {
    if (selectionState.value.mode === 'explicit') {
      return selectionState.value.ids.includes(id);
    }

    return !selectionState.value.excludedIds.includes(id);
  }

  function getSelectionRules(): RuleGroup {
    if (selectionState.value.mode === 'explicit') {
      return {
        condition: 'OR',
        rules: selectionState.value.ids.map((id) => ({
          field: 'id',
          operator: 'equal',
          value: [id],
        })),
      };
    }

    return {
      condition: 'AND',
      rules: selectionState.value.excludedIds.map((id) => ({
        field: 'id',
        operator: 'not_equal',
        value: [id],
      })),
    };
  }

  const selectedCount = computed(() => {
    if (selectionState.value.mode === 'explicit') {
      return selectionState.value.ids.length;
    }

    return itemCount.value - selectionState.value.excludedIds.length;
  });

  return {
    selectionState,
    selectedCount,
    isSelected,
    getSelectionRules,
  };
}
