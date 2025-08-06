<template>
  <div class="flex-none md:hidden md:basis-menu">
    <AppTabsCompact v-model="currentItem" :items="items" />
  </div>
  <div class="flex flex-col gap-6 md:flex-row">
    <div class="flex-none md:basis-menu">
      <AppVTabs v-model="currentItem" :items="items" class="hidden md:block" />
    </div>
    <div class="flex-auto">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import type { TabItem } from '../../types';
import { AppTabsCompact, AppVTabs } from '../tabs';

/**
 * Filter grid component that combines compact tabs for mobile and vertical tabs for desktop
 *
 * @example
 * ```vue
 * <AppFilterGrid
 *   v-model="selectedFilter"
 *   :items="filterItems"
 * >
 *   <div>Content goes here</div>
 * </AppFilterGrid>
 * ```
 */

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const props = defineProps<{
  /** Array of tab items */
  items: TabItem[];
  /** Currently selected item value */
  modelValue: string;
}>();

const currentItem = computed({
  get: () => props.modelValue,
  set: (item) => emit('update:modelValue', item),
});
</script>
