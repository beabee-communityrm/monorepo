<template>
  <!-- Tab Navigation -->
  <div
    :class="{
      'rounded-t-lg bg-primary-10': true,
      'px-1 pt-1 shadow-sm': variant === 'boxed',
      'sticky top-0 z-50': stickyTabs,
    }"
  >
    <AppTabs
      :items="items"
      :selected="modelValue"
      class="!mb-0 !rounded-t-lg !p-0"
      @tab-click="$emit('update:modelValue', $event)"
    />
  </div>

  <!-- Tab Content -->
  <div
    :class="{
      'rounded-b-lg bg-white': variant === 'boxed',
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
