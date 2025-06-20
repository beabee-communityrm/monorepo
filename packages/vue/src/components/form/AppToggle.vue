<template>
  <template v-for="(item, i) in items" :key="item.id">
    <button
      class="mx-2 rounded p-2 text-sm font-bold text-primary-80"
      type="button"
      :class="{ 'bg-primary-20': modelValue === item.id }"
      @click="$emit('update:modelValue', item.id)"
    >
      {{ item.label }}
    </button>
    <span v-if="i < items.length - 1">&bull;</span>
  </template>
</template>
<script lang="ts" setup>
/**
 * Props for the AppToggle component
 */
export interface AppToggleProps {
  /** The model value of the toggle */
  modelValue: string;
  /** The items to display in the toggle */
  items: {
    id: string;
    label: string;
  }[];
}

defineEmits(['update:modelValue']);
defineProps<AppToggleProps>();
</script>
