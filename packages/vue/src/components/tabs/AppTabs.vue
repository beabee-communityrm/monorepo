<template>
  <div class="mb-4 rounded-md bg-primary-10 p-4">
    <div :class="orientation === 'vertical' ? '' : 'overflow-x-auto'">
      <ul
        :class="[
          'gap-2',
          orientation === 'vertical' ? 'flex-col' : 'flex whitespace-nowrap',
        ]"
      >
        <li v-for="item in visibleItems" :key="item.id">
          <router-link
            v-if="item.to"
            :to="item.to"
            class="relative inline-block whitespace-nowrap rounded-md px-4 py-2 font-semibold transition-colors"
            :class="[
              selected === item.id
                ? 'bg-white text-body shadow-sm'
                : 'text-body-80 hover:bg-primary-5 hover:text-body',
              orientation === 'vertical' ? 'w-full' : '',
            ]"
          >
            <TabLabel
              :label="item.label"
              :count="item.count"
              :error="item.error"
              :validated="item.validated"
            />
          </router-link>
          <button
            v-else
            type="button"
            class="relative inline-block whitespace-nowrap rounded-md px-4 py-2 font-semibold transition-colors"
            :class="[
              selected === item.id
                ? 'bg-white text-body shadow-sm'
                : 'text-body-80 hover:bg-primary-5 hover:text-body',
              orientation === 'vertical' ? 'w-full' : '',
            ]"
            @click="handleTabClick(item.id)"
          >
            <TabLabel
              :label="item.label"
              :count="item.count"
              :error="item.error"
              :validated="item.validated"
            />
          </button>
        </li>
      </ul>
    </div>
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
import type { TabItem } from '../../types/tabs.interface';
import TabLabel from './TabLabel.vue';
import { computed } from 'vue';

/**
 * Props for the AppTabs component
 * @property {TabItem[]} items - Array of tab items to display
 * @property {string | null} selected - ID of the currently selected tab
 * @property {'horizontal' | 'vertical'} orientation - Layout orientation of the tabs
 * @property {string | undefined} defaultTab - Default tab to fall back to
 */
export interface AppTabsProps {
  items: TabItem[];
  selected: string | null;
  orientation?: 'horizontal' | 'vertical';
  defaultTab?: string;
}

const props = withDefaults(defineProps<AppTabsProps>(), {
  items: () => [],
  selected: null,
  orientation: 'horizontal',
  defaultTab: undefined,
});

/**
 * Events emitted by the AppTabs component
 * @event {string} tab-click - Emitted when a non-router tab is clicked, provides the tab ID
 */
const emit = defineEmits<{
  'tab-click': [id: string];
}>();

/**
 * Filter out hidden items for display
 */
const visibleItems = computed(() => props.items.filter((item) => !item.hidden));

/**
 * Handle tab click event and emit selected tab
 */
const handleTabClick = (id: string) => {
  emit('tab-click', id);
};
</script>
