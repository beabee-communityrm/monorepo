<template>
  <!-- Tab Navigation -->
  <div
    :class="{
      'rounded-t-lg border border-white shadow-sm': variant === 'boxed',
      'sticky top-0 z-50': stickyTabs,
      'bg-white px-1 pt-1': variant === 'boxed',
      'bg-primary-5': variant === 'transparent',
      'rounded-t-lg border border-white': variant === 'transparent',
    }"
  >
    <AppTabs
      :items="items"
      :selected="modelValue"
      class="!mb-0 !rounded-none !border-0 !p-0"
      @tab-click="$emit('update:modelValue', $event)"
    />
  </div>

  <!-- Tab Content -->
  <div
    :class="{
      'rounded-b-lg border border-t-0 border-white bg-white p-4':
        variant === 'boxed',
      'pt-4': variant === 'transparent',
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
