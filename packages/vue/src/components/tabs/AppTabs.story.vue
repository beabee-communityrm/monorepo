<script lang="ts" setup>
import { reactive } from 'vue';
import { AppTabs, type AppTabsProps, type TabItem } from './index';

const state = reactive({
  selectedTab: 'tab1',
  orientation: 'horizontal' as AppTabsProps['orientation'],
  defaultTab: 'tab1' as AppTabsProps['defaultTab'],
});

// Sample tabs data
const basicTabs: TabItem[] = [
  { id: 'tab1', label: 'Overview', to: '' },
  { id: 'tab2', label: 'Settings', to: '' },
  { id: 'tab3', label: 'Security', to: '' },
];

const tabsWithCounts: TabItem[] = [
  { id: 'inbox', label: 'Inbox', count: 12 },
  { id: 'sent', label: 'Sent', count: 5 },
  { id: 'draft', label: 'Draft', count: 3 },
];

const routerTabs: TabItem[] = [
  { id: 'overview', label: 'Overview', to: '/overview' },
  { id: 'settings', label: 'Settings', to: '/settings' },
  { id: 'security', label: 'Security', to: '/security' },
];

const handleTabClick = (tabId: string) => {
  state.selectedTab = tabId;
};
</script>

<template>
  <Story title="Components/Tabs/AppTabs">
    <Variant title="Basic">
      <div class="flex flex-col gap-4">
        <AppTabs
          :items="basicTabs"
          :selected="state.selectedTab"
          :orientation="state.orientation"
          :default-tab="state.defaultTab"
          @tab-click="handleTabClick"
        />
      </div>

      <template #controls>
        <HstSelect
          v-model="state.orientation"
          title="Orientation"
          :options="['horizontal', 'vertical']"
        />
        <HstText v-model="state.defaultTab" title="Default Tab" />
      </template>
    </Variant>

    <Variant title="With Counts">
      <AppTabs
        :items="tabsWithCounts"
        :selected="state.selectedTab"
        @tab-click="handleTabClick"
      />
    </Variant>

    <Variant title="Router Based">
      <AppTabs :items="routerTabs" :selected="state.selectedTab" />
    </Variant>

    <Variant title="Real World Example - Callout Tabs">
      <AppTabs
        :items="[
          { id: 'content', label: 'Content', to: '' },
          { id: 'settings', label: 'Settings', to: '' },
          { id: 'dates', label: 'Dates & Duration', to: '' },
          { id: 'titleAndImage', label: 'Title & Image', to: '' },
        ]"
        :selected="state.selectedTab"
        @tab-click="handleTabClick"
      />
    </Variant>
  </Story>
</template>
