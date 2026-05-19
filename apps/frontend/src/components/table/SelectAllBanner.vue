<template>
  <div class="rounded bg-primary-10 p-2 text-center text-sm">
    <div v-if="showSelectAllBanner">
      All {{ pageSelectedCount }} contacts on this page are selected.

      <button
        class="font-semibold text-link"
        @click="$emit('select-all-matching')"
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
defineProps<{
  showSelectAllBanner: boolean;
  showClearSelectionBanner: boolean;
  total: number;
  pageSelectedCount: number;
  selectedCount: number;
}>();

defineEmits<{
  'select-all-matching': [];
  'clear-selection': [];
}>();
</script>
