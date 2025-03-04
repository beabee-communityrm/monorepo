<template>
  <AppTabs
    class="flex-none"
    :items="tabItems"
    :selected="selectedTab"
    @tab-click="handleTabClick"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { TabItem } from '@beabee/vue/components/tabs';
import type { CalloutHorizontalTab } from './CalloutHorizontalTabs.interface';

export interface CalloutHorizontalTabsNavigationProps {
  selectedTab: string;
  tabsInOrder: CalloutHorizontalTab<unknown>[];
}

const props = defineProps<CalloutHorizontalTabsNavigationProps>();
const emit = defineEmits<{
  'update:selectedTab': [value: string];
}>();

const tabItems = computed<TabItem[]>(() =>
  props.tabsInOrder.map((step) => ({
    id: step.name,
    label: step.name,
    to: '',
  }))
);

const handleTabClick = (tabId: string) => {
  emit('update:selectedTab', tabId);
};
</script>
