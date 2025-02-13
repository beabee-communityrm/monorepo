<template>
  <ul class="mb-4 flex border-b border-primary-40 text-sm md:mb-6 xl:text-base">
    <li v-for="item in items" :key="item.id">
      <router-link
        v-if="item.to"
        :to="item.to"
        class="relative inline-block p-2"
        :class="
          selected === item.id && 'border-text border-b-2 font-bold text-body'
        "
      >
        <span class="text-body-80 hover:text-body">
          {{ item.label }}
          <span v-if="item.count !== undefined" class="ml-1">
            ({{ item.count }})
          </span>
        </span>
      </router-link>
      <button
        v-else
        type="button"
        class="relative inline-block p-2"
        :class="
          selected === item.id && 'border-text border-b-2 font-bold text-body'
        "
        @click="$emit('tab-click', item.id)"
      >
        <span class="text-body-80 hover:text-body">
          {{ item.label }}
          <span v-if="item.count !== undefined" class="ml-1">
            ({{ item.count }})
          </span>
        </span>
      </button>
    </li>
  </ul>
</template>

<script lang="ts">
/**
 * Tab navigation component that supports both router-based and click-based navigation.
 * @displayName AppTabs
 */
export default {
  name: 'AppTabs',
};
</script>

<script lang="ts" setup>
import type { TabItem } from './tabs.interface';

/**
 * Props for the AppTabs component
 * @property {TabItem[]} items - Array of tab items to display
 * @property {string | null} selected - ID of the currently selected tab
 */
defineProps<{
  items: TabItem[];
  selected: string | null;
}>();

/**
 * Events emitted by the AppTabs component
 * @event {string} tab-click - Emitted when a non-router tab is clicked, provides the tab ID
 */
defineEmits<{
  'tab-click': [id: string];
}>();
</script>
