<template>
  <div
    v-if="showSelectAllBanner || showClearSelectionBanner"
    class="rounded bg-primary-10 p-2 text-center text-sm"
  >
    <div v-if="showSelectAllBanner">
      All {{ pageSelectedCount }} contacts on this page are selected.

      <button
        class="font-semibold text-link"
        @click="$emit('select-all-global')"
      >
        Select all {{ total }} contacts
      </button>
    </div>

    <div v-else-if="showClearSelectionBanner">
      All {{ selectedCount }} matching contacts are selected.

      <button class="font-semibold text-link" @click="$emit('clear-selection')">
        Clear selection
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  PageSelectionState,
  SelectionState,
} from '#composables/useSelectionState';
import { computed } from 'vue';

const props = defineProps<{
  total: number;
  pageSelectedCount: number;
  selectedCount: number;
  itemsPerPage: number;
  pageSelectionState: PageSelectionState;
  selectionState: SelectionState;
}>();

defineEmits<{
  'select-all-global': [];
  'clear-selection': [];
}>();

const showSelectAllBanner = computed(() => {
  return (
    props.pageSelectionState === 'all' &&
    props.selectionState.mode !== 'all' &&
    props.total > props.itemsPerPage
  );
});

const showClearSelectionBanner = computed(() => {
  return (
    props.selectionState.mode === 'all' &&
    props.selectionState.excludedIds.size === 0
  );
});
</script>
