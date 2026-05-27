import type { RuleGroup } from '@beabee/beabee-common';

import { type Ref, computed, ref } from 'vue';

export type SelectionState =
  | { mode: 'explicit'; ids: Set<string> }
  | { mode: 'all'; excludedIds: Set<string> };

export type PageSelectionState = 'none' | 'partial' | 'all';

export function useSelectionState(itemCount: Ref<number>) {
  const selectionState = ref<SelectionState>({
    mode: 'explicit',
    ids: new Set(),
  });

  function isSelected(id: string): boolean {
    if (selectionState.value.mode === 'explicit') {
      return selectionState.value.ids.has(id);
    }

    return !selectionState.value.excludedIds.has(id);
  }

  function applySelectionToRules(baseRules: RuleGroup): RuleGroup {
    if (selectionState.value.mode === 'explicit') {
      return {
        condition: 'AND',
        rules: [
          baseRules,
          {
            condition: 'OR',
            rules: Array.from(selectionState.value.ids).map((id) => ({
              field: 'id',
              operator: 'equal',
              value: [id],
            })),
          },
        ],
      };
    }

    if (selectionState.value.excludedIds.size === 0) {
      return baseRules;
    }

    return {
      condition: 'AND',
      rules: [
        baseRules,
        {
          condition: 'AND',
          rules: Array.from(selectionState.value.excludedIds).map((id) => ({
            field: 'id',
            operator: 'not_equal',
            value: [id],
          })),
        },
      ],
    };
  }

  const selectedCount = computed(() => {
    if (selectionState.value.mode === 'explicit') {
      return selectionState.value.ids.size;
    }

    return itemCount.value - selectionState.value.excludedIds.size;
  });

  return {
    selectionState,
    selectedCount,
    isSelected,
    applySelectionToRules,
  };
}
