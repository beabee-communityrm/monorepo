<script lang="ts" setup>
import { reactive } from 'vue';

import type { TabItem } from '../../types';
import { AppTabs, type AppTabsProps } from './index';

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

// Validation state tabs
const validationTabs: TabItem[] = [
  { id: 'completed', label: 'Completed', validated: true },
  { id: 'inProgress', label: 'In Progress' },
  { id: 'problematic', label: 'Problematic', error: true },
  { id: 'pendingWithIssues', label: 'Pending', error: true, count: 3 },
  { id: 'validatedWithCount', label: 'Validated', validated: true, count: 7 },
];

// Many tabs to demonstrate horizontal scrolling
const manyTabs: TabItem[] = [
  { id: 'tab1', label: 'Overview', to: '' },
  { id: 'tab2', label: 'Settings', to: '' },
  { id: 'tab3', label: 'Security', to: '' },
  { id: 'tab4', label: 'User Management', to: '' },
  { id: 'tab5', label: 'Integrations', to: '' },
  { id: 'tab6', label: 'Analytics', to: '' },
  { id: 'tab7', label: 'Notifications', to: '' },
  { id: 'tab8', label: 'Billing', to: '' },
  { id: 'tab9', label: 'Support', to: '' },
  { id: 'tab10', label: 'Documentation', to: '' },
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

    <Variant title="With Validation States">
      <div class="flex flex-col gap-4">
        <p class="text-sm text-grey-dark">
          Tabs with validation states (error, validated) and combined with
          counts
        </p>
        <AppTabs
          :items="validationTabs"
          :selected="state.selectedTab"
          @tab-click="handleTabClick"
        />
      </div>
    </Variant>

    <Variant title="Real World Example - Callout Tabs">
      <AppTabs
        :items="[
          { id: 'content', label: 'Content', validated: true, to: '' },
          { id: 'settings', label: 'Settings', to: '' },
          { id: 'dates', label: 'Dates & Duration', error: true, to: '' },
          { id: 'titleAndImage', label: 'Title & Image', to: '' },
        ]"
        :selected="state.selectedTab"
        @tab-click="handleTabClick"
      />
    </Variant>

    <Variant title="Horizontal Scrolling">
      <div class="w-full max-w-md">
        <p class="mb-2 text-sm text-grey-dark">
          Container with limited width to show scrolling behavior
        </p>
        <AppTabs
          :items="manyTabs"
          :selected="state.selectedTab"
          @tab-click="handleTabClick"
        />
      </div>
    </Variant>
  </Story>
</template>
