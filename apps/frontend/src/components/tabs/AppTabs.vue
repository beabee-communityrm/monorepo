<template>
  <div class="mb-2 rounded-lg border border-white p-1">
    <ul :class="['gap-1', orientation === 'vertical' ? 'flex-col' : 'flex']">
      <li v-for="item in items" :key="item.id">
        <router-link
          v-if="item.to"
          :to="item.to"
          class="relative my-2 inline-block rounded-md px-4 py-2 font-semibold transition-colors"
          :class="[
            selected === item.id
              ? 'bg-white text-body shadow-sm'
              : 'text-body-80 hover:bg-primary-5 hover:text-body',
            orientation === 'vertical' ? 'w-full' : 'mx-1',
          ]"
        >
          <span>
            {{ item.label }}
            <span v-if="item.count !== undefined" class="ml-1">
              ({{ item.count }})
            </span>
          </span>
        </router-link>
        <button
          v-else
          type="button"
          class="relative my-2 inline-block rounded-md px-4 py-2 font-semibold transition-colors"
          :class="[
            selected === item.id
              ? 'bg-white text-body shadow-sm'
              : 'text-body-80 hover:bg-primary-5 hover:text-body',
            orientation === 'vertical' ? 'w-full' : 'mx-1',
          ]"
          @click="$emit('tab-click', item.id)"
        >
          <span>
            {{ item.label }}
            <span v-if="item.count !== undefined" class="ml-1">
              ({{ item.count }})
            </span>
          </span>
        </button>
      </li>
    </ul>
  </div>
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
 * @property {'horizontal' | 'vertical'} orientation - Layout orientation of the tabs
 */
withDefaults(
  defineProps<{
    items: TabItem[];
    selected: string | null;
    orientation?: 'horizontal' | 'vertical';
  }>(),
  {
    items: () => [],
    selected: null,
    orientation: 'horizontal',
  }
);

/**
 * Events emitted by the AppTabs component
 * @event {string} tab-click - Emitted when a non-router tab is clicked, provides the tab ID
 */
defineEmits<{
  'tab-click': [id: string];
}>();
</script>
