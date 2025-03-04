<template>
  <div class="mb-6">
    <AppTabs
      :items="visibleTabItems"
      :selected="selectedTab"
      :default-tab="defaultTabName"
      orientation="vertical"
      @tab-click="handleTabClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { AppTabs, type TabItem } from '@beabee/vue/components/tabs';
import type { SidebarTabs } from './SidebarTabs.interface';
/**
 * Props for the SidebarTabsNavigation component
 */
export interface SidebarTabsNavigationProps {
  /** The currently selected tab name */
  selectedTab: string;
  /** Configuration for all sidebar tabs */
  sidebarTabs: SidebarTabs;
  /** Default tab to fall back to */
  defaultTab?: string;
}

const props = defineProps<SidebarTabsNavigationProps>();

const emit = defineEmits<{
  'update:selectedTab': [value: string];
}>();

/**
 * Computed default tab name from sidebar tabs or fallback to 'content'
 */
const defaultTabName = computed(
  () => props.defaultTab ?? props.sidebarTabs.content.name
);

/**
 * All tab items including the hidden default tab
 */
const allTabItems = computed<TabItem[]>(() => [
  {
    id: props.sidebarTabs.content.name,
    label: props.sidebarTabs.content.name,
    to: '',
    hidden: true,
  },
  {
    id: props.sidebarTabs.intro.name,
    label: props.sidebarTabs.intro.name,
    to: '',
  },
  {
    id: props.sidebarTabs.endMessage.name,
    label: props.sidebarTabs.endMessage.name,
    to: '',
  },
]);

/**
 * Only visible tab items for display
 */
const visibleTabItems = computed(() =>
  allTabItems.value.filter((item) => !item.hidden)
);

/**
 * Handle tab click event and emit selected tab update
 * If clicking an already selected tab, switch to default tab
 */
const handleTabClick = (tabId: string) => {
  if (tabId === props.selectedTab) {
    emit('update:selectedTab', defaultTabName.value);
  } else {
    emit('update:selectedTab', tabId);
  }
};
</script>
