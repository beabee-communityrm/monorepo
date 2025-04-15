<template>
  <!-- Tab Navigation -->
  <div
    :class="{
      '-mb-4': true,
      'bg-primary-10 shadow-sm': variant === 'boxed',
      'sticky top-0 z-50': stickyTabs,
    }"
  >
    <AppTabs
      :items="items"
      :selected="modelValue"
      @tab-click="$emit('update:modelValue', $event)"
    />
  </div>

  <!-- Tab Content -->
  <div
    :class="{
      'bg-white px-4': variant === 'boxed',
      'py-4': true,
    }"
  >
    <slot :selected="modelValue" />
  </div>
</template>

<script lang="ts" setup>
import type { TabItem } from '../../types/tabs.interface';
import AppTabs from './AppTabs.vue';

export type AppTabCardVariant = 'boxed' | 'transparent';

export interface AppTabCardProps {
  /** Array of tab items to display */
  items: TabItem[];
  /** Currently selected tab ID */
  modelValue: string;
  /** Visual variant of the tab card */
  variant?: AppTabCardVariant;
  /** Whether the tabs should stick to the top when scrolling */
  stickyTabs?: boolean;
}

withDefaults(defineProps<AppTabCardProps>(), {
  variant: 'boxed',
  stickyTabs: false,
});

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>
