<template>
  <div class="overflow-hidden rounded-lg border border-white shadow-sm">
    <!-- Tab Navigation -->
    <div class="px-1 pt-1">
      <AppTabs
        :items="items"
        :selected="modelValue"
        class="!mb-0 !rounded-none !border-0 !p-0"
        @tab-click="$emit('update:modelValue', $event)"
      />
    </div>

    <!-- Tab Content -->
    <div class="border-t border-white bg-white p-4">
      <slot :selected="modelValue" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TabItem } from './tabs.interface';
import AppTabs from './AppTabs.vue';

export interface AppTabCardProps {
  /** Array of tab items to display */
  items: TabItem[];
  /** Currently selected tab ID */
  modelValue: string;
}

defineProps<AppTabCardProps>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>
