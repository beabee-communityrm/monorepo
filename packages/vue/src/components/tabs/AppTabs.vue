<template>
  <div class="mb-4 rounded-t-md bg-primary-10 p-1">
    <div>
      <ul class="flex gap-1 whitespace-nowrap">
        <li v-for="item in visibleItems" :key="item.id">
          <router-link
            v-if="item.to"
            :to="item.to"
            class="relative m-1 inline-block whitespace-nowrap rounded-md px-4 py-2 font-semibold transition-colors"
            :class="[
              selected === item.id
                ? 'bg-white text-body shadow-sm'
                : 'text-body-80 hover:bg-primary-5 hover:text-body',
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
            class="relative m-1 inline-block whitespace-nowrap rounded-md px-4 py-2 font-semibold transition-colors"
            :class="[
              selected === item.id
                ? 'bg-white text-body shadow-sm'
                : 'text-body-80 hover:bg-primary-5 hover:text-body',
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
import type { TabItem } from './tabs.interface';
import TabLabel from './TabLabel.vue';
import { computed } from 'vue';

/**
 * Props for the AppTabs component
 * @property {TabItem[]} items - Array of tab items to display
 * @property {string | null} selected - ID of the currently selected tab
 * @property {string | undefined} defaultTab - Default tab to fall back to
 */
export interface AppTabsProps {
  items: TabItem[];
  selected: string | null;
  defaultTab?: string;
}

const props = withDefaults(defineProps<AppTabsProps>(), {
  items: () => [],
  selected: null,
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
