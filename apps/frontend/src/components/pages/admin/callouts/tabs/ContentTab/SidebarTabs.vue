<template>
  <div class="mb-6">
    <AppTabs
      :items="tabItems"
      :selected="selectedTab"
      orientation="vertical"
      @tab-click="handleTabClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import AppTabs from '@components/tabs/AppTabs.vue';
import type { TabItem } from '@components/tabs/tabs.interface';
import type { SidebarTabs } from './sidebar-tabs.interface';

interface Props {
  /** The currently selected tab name */
  selectedTab: string;
  /** Configuration for all sidebar tabs */
  sidebarTabs: SidebarTabs;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:selectedTab': [value: string];
}>();

/**
 * Convert sidebar tabs into tab items for AppTabs component
 */
const tabItems = computed<TabItem[]>(() => [
  {
    id: props.sidebarTabs.content.name,
    label: props.sidebarTabs.content.name,
    to: '',
  },
  {
    id: props.sidebarTabs.endMessage.name,
    label: props.sidebarTabs.endMessage.name,
    to: '',
  },
]);

/**
 * Handle tab click event and emit selected tab update
 */
const handleTabClick = (tabId: string) => {
  emit('update:selectedTab', tabId);
};
</script>
