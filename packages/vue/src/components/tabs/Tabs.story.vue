<script lang="ts" setup>
import { reactive } from 'vue';
import {
  AppTabs,
  AppTabsCompact,
  AppVTabs,
  type AppTabsProps,
  type TabItem,
} from './index';

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

const verticalTabs: TabItem[] = [
  { id: 'content', label: 'Content', count: 3 },
  { id: 'intro', label: 'Introduction' },
  { id: 'endMessage', label: 'End Message' },
];

const handleTabClick = (tabId: string) => {
  state.selectedTab = tabId;
};
</script>

<template>
  <Story title="Components/Tabs">
    <Variant title="AppTabs - Basic">
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

    <Variant title="AppTabs - With Counts">
      <AppTabs
        :items="tabsWithCounts"
        :selected="state.selectedTab"
        @tab-click="handleTabClick"
      />
    </Variant>

    <Variant title="AppTabs - Router Based">
      <AppTabs :items="routerTabs" :selected="state.selectedTab" />
    </Variant>

    <Variant title="AppTabsCompact">
      <div class="w-[300px]">
        <AppTabsCompact v-model="state.selectedTab" :items="tabsWithCounts" />
      </div>
    </Variant>

    <Variant title="AppVTabs">
      <div class="w-[200px]">
        <AppVTabs v-model="state.selectedTab" :items="verticalTabs" />
      </div>
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

    <Variant title="Real World Example - Filter Grid">
      <div class="flex gap-4">
        <div class="w-[200px]">
          <AppVTabs
            v-model="state.selectedTab"
            :items="[
              { id: 'all', label: 'All Items', count: 42 },
              { id: 'active', label: 'Active', count: 18 },
              { id: 'archived', label: 'Archived', count: 24 },
            ]"
          />
        </div>
        <div class="flex-1">
          <div class="rounded-lg border p-4">
            Content for {{ state.selectedTab }}
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
