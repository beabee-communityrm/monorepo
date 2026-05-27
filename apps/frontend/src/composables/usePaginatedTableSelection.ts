import { type Ref, computed } from 'vue';

import type {
  PageSelectionState,
  SelectionState,
} from '#composables/useSelectionState';

import type { Item } from '../type/table';

type Args<I extends Item> = {
  selectable?: boolean;
  selectionState: Ref<SelectionState>;
  items: Ref<I[]>;
  totalItems: Ref<number>;
  limit: Ref<number>;
};

export type BannerMode = 'none' | 'select-all' | 'clear-selection';

export function usePaginatedTableSelection<I extends Item>(args: Args<I>) {
  const { selectable, selectionState, items, totalItems, limit } = args;

  const enabled = computed(() => !!selectable);

  function isSelected(id: string): boolean {
    const state = selectionState.value;
    if (!state) return false;

    if (state.mode === 'explicit') {
      return state.ids.has(id);
    }

    return !state.excludedIds.has(id);
  }

  function setState(next: SelectionState) {
    selectionState.value = next;
  }

  function clearSelection() {
    setState({
      mode: 'explicit',
      ids: new Set(),
    });
  }

  function selectAllGlobal() {
    setState({
      mode: 'all',
      excludedIds: new Set(),
    });
  }

  function setSelection(id: string, selected: boolean) {
    const state = selectionState.value;
    if (!state) return;

    if (state.mode === 'explicit') {
      const next = new Set(state.ids);

      if (selected) next.add(id);
      else next.delete(id);

      setState({
        mode: 'explicit',
        ids: next,
      });

      return;
    }

    const excluded = new Set(state.excludedIds);

    if (selected) excluded.delete(id);
    else excluded.add(id);

    setState({
      mode: 'all',
      excludedIds: excluded,
    });
  }

  function setPageSelection(selected: boolean) {
    const state = selectionState.value;
    if (!state) return;

    const ids = items.value.map((i) => i.id);

    if (state.mode === 'explicit') {
      if (selected) {
        setState({
          mode: 'explicit',
          ids: new Set([...state.ids, ...ids]),
        });
      } else {
        const next = new Set(state.ids);
        ids.forEach((id) => next.delete(id));

        setState({
          mode: 'explicit',
          ids: next,
        });
      }

      return;
    }

    const excluded = new Set(state.excludedIds);

    if (selected) {
      ids.forEach((id) => excluded.delete(id));
    } else {
      ids.forEach((id) => excluded.add(id));
    }

    setState({
      mode: 'all',
      excludedIds: excluded,
    });
  }

  const pageSelectedItems = computed(() => {
    return items.value.filter((i) => isSelected(i.id));
  });

  const pageSelectedIds = computed(() =>
    pageSelectedItems.value.map((i) => i.id)
  );

  const pageSelectionState = computed<PageSelectionState>(() => {
    if (!items.value.length) return 'none';

    const selectedCount = pageSelectedItems.value.length;

    if (selectedCount === 0) return 'none';
    if (selectedCount === items.value.length) return 'all';

    return 'partial';
  });

  const bannerMode = computed<BannerMode>(() => {
    const state = selectionState.value;
    if (!state) return 'none';

    const isSinglePage = totalItems.value <= limit.value;

    if (
      pageSelectionState.value === 'all' &&
      state.mode !== 'all' &&
      !isSinglePage
    ) {
      return 'select-all';
    }

    if (state.mode === 'all' && state.excludedIds.size === 0) {
      return 'clear-selection';
    }

    return 'none';
  });

  return {
    enabled,

    // state helpers
    isSelected,

    // actions
    clearSelection,
    selectAllGlobal,
    setSelection,
    setPageSelection,

    // derived state
    pageSelectedItems,
    pageSelectedIds,
    pageSelectionState,
    bannerMode,
  };
}
