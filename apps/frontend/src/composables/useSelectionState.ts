import type { RuleGroup } from '@beabee/beabee-common';

import { type ComputedRef, type Ref, computed, ref } from 'vue';

export type SelectionState =
  | { mode: 'explicit'; ids: string[] }
  | { mode: 'all'; excludedIds: string[] };

export function useSelectionState<I extends { id: string }>(
  items: Ref<I[]> | ComputedRef<I[]>
) {
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

  const selectedItems = computed(() =>
    items.value.filter((item) => isSelected(item.id))
  );

  const selectedCount = computed(() => selectedItems.value.length);

  return {
    selectionState,
    selectedItems,
    selectedCount,
    isSelected,
    getSelectionRules,
  };
}
