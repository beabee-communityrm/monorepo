import { type Ref, computed, ref } from 'vue';

type SelectionState =
  | { mode: 'explicit'; ids: Set<string> }
  | { mode: 'all'; excludedIds: Set<string> };

interface SelectableItem {
  id: string;
}

export function useSelectionState<T extends SelectableItem>(
  items: Ref<T[]>,
  total: Ref<number>
) {
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

  function clearSelection() {
    selectionState.value = {
      mode: 'explicit',
      ids: new Set(),
    };
  }

  function selectAllMatching() {
    selectionState.value = {
      mode: 'all',
      excludedIds: new Set(),
    };
  }

  function toggleSelection(id: string, selected: boolean) {
    if (selectionState.value.mode === 'explicit') {
      const next = new Set(selectionState.value.ids);

      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }

      selectionState.value = {
        mode: 'explicit',
        ids: next,
      };

      return;
    }

    const excluded = new Set(selectionState.value.excludedIds);

    if (selected) {
      excluded.delete(id);
    } else {
      excluded.add(id);
    }

    selectionState.value = {
      mode: 'all',
      excludedIds: excluded,
    };
  }

  function toggleSelectAll(selected: boolean) {
    const ids = items.value.map((i) => i.id);

    if (selectionState.value.mode === 'explicit') {
      if (selected) {
        selectionState.value = {
          mode: 'explicit',
          ids: new Set([...selectionState.value.ids, ...ids]),
        };
      } else {
        const next = new Set(selectionState.value.ids);

        ids.forEach((id) => next.delete(id));

        selectionState.value = {
          mode: 'explicit',
          ids: next,
        };
      }

      return;
    }

    const excluded = new Set(selectionState.value.excludedIds);

    if (selected) {
      ids.forEach((id) => excluded.delete(id));
    } else {
      ids.forEach((id) => excluded.add(id));
    }

    selectionState.value = {
      mode: 'all',
      excludedIds: excluded,
    };
  }

  const pageSelectionState = computed<'none' | 'partial' | 'all'>(() => {
    if (items.value.length === 0) {
      return 'none';
    }

    const selectedCount = items.value.filter((item) =>
      isSelected(item.id)
    ).length;

    if (selectedCount === 0) {
      return 'none';
    }

    if (selectedCount === items.value.length) {
      return 'all';
    }

    return 'partial';
  });

  const selectedIdsArray = computed(() => {
    return items.value.filter((i) => isSelected(i.id)).map((i) => i.id);
  });

  const selectedCount = computed(() => {
    if (selectionState.value.mode === 'explicit') {
      return selectionState.value.ids.size;
    }

    return total.value - selectionState.value.excludedIds.size;
  });

  const showSelectAllBanner = computed(() => {
    return (
      pageSelectionState.value === 'all' &&
      selectionState.value.mode !== 'all' &&
      total.value > items.value.length
    );
  });

  const showClearSelectAllBanner = computed(() => {
    return selectionState.value.mode === 'all';
  });

  return {
    selectionState,

    isSelected,

    clearSelection,
    selectAllMatching,

    toggleSelection,
    toggleSelectAll,

    pageSelectionState,

    selectedIdsArray,
    selectedCount,

    showSelectAllBanner,
    showClearSelectAllBanner,
  };
}
