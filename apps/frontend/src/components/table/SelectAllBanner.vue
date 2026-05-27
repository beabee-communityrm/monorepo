<template>
  <div
    v-if="mode !== 'none'"
    class="rounded bg-primary-10 p-2 text-center text-sm"
  >
    <div v-if="mode === 'select-all'">
      All {{ pageSelectedCount }} items on this page are selected.

      <button
        class="font-semibold text-link"
        @click="$emit('select-all-global')"
      >
        Select all {{ total }} items
      </button>
    </div>

    <div v-else-if="mode === 'clear-selection'">
      All {{ total }} matching items are selected.

      <button class="font-semibold text-link" @click="$emit('clear-selection')">
        Clear selection
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  mode: 'none' | 'select-all' | 'clear-selection';
  total: number;
  pageSelectedCount: number;
}>();

defineEmits<{
  'select-all-global': [];
  'clear-selection': [];
}>();
</script>
