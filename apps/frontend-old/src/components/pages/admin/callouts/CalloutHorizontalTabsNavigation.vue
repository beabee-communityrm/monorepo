<template>
  <AppTabs
    class="flex-none"
    :items="tabItems"
    :selected="selectedTab"
    @tab-click="handleTabClick"
  />
</template>

<script lang="ts" setup>
import type { TabItem } from '@beabee/vue';
import { AppTabs } from '@beabee/vue';

import { computed } from 'vue';

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
  props.tabsInOrder.map((tab) => ({
    id: tab.name,
    label: tab.name,
    to: '',
    error: tab.error,
    validated: tab.validated,
  }))
);

const handleTabClick = (tabId: string) => {
  emit('update:selectedTab', tabId);
};
</script>
