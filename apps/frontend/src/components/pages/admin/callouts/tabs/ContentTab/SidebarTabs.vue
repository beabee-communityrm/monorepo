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
import AppTabs from '../../../../../tabs/AppTabs.vue';
import type { TabItem } from '../../../../../tabs/tabs.interface';
import type { SidebarTabs } from './sidebar-tabs.interface';

const props = defineProps<{
  sidebarTabs: SidebarTabs;
  selectedTab: string;
}>();

const emit = defineEmits<{
  'update:selectedTab': [value: string];
}>();

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

const handleTabClick = (tabId: string) => {
  emit('update:selectedTab', tabId);
};
</script>
