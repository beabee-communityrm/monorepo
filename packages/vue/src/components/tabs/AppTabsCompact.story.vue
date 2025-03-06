<script lang="ts" setup>
import { reactive } from 'vue';
import { AppTabsCompact, type TabItem } from './index';

const state = reactive({
  selectedTab: 'inbox',
});

const tabsWithCounts: TabItem[] = [
  { id: 'inbox', label: 'Inbox', count: 12 },
  { id: 'sent', label: 'Sent', count: 5 },
  { id: 'draft', label: 'Draft', count: 3 },
  { id: 'archived', label: 'Archived', count: 8 },
  { id: 'spam', label: 'Spam', count: 2 },
  { id: 'trash', label: 'Trash', count: 0 },
];

const navigationTabs: TabItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'profile', label: 'Profile' },
  { id: 'settings', label: 'Settings' },
  { id: 'help', label: 'Help' },
];
</script>

<template>
  <Story title="Components/Tabs/AppTabsCompact">
    <Variant title="Basic">
      <div class="w-full">
        <AppTabsCompact v-model="state.selectedTab" :items="navigationTabs" />
        <div class="p-4">
          <p>Selected tab: {{ state.selectedTab }}</p>
        </div>
      </div>
    </Variant>

    <Variant title="With Counts">
      <div class="w-full">
        <AppTabsCompact v-model="state.selectedTab" :items="tabsWithCounts" />
        <div class="p-4">
          <p>Selected tab: {{ state.selectedTab }}</p>
        </div>
      </div>
    </Variant>

    <Variant title="Mobile View">
      <div class="w-[320px] border">
        <AppTabsCompact v-model="state.selectedTab" :items="tabsWithCounts" />
        <div class="p-4">
          <p>Selected tab: {{ state.selectedTab }}</p>
        </div>
      </div>
    </Variant>
  </Story>
</template>
