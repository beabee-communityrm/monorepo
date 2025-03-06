<script lang="ts" setup>
import { reactive } from 'vue';
import { AppVTabs, type TabItem } from './index';

const state = reactive({
  selectedTab: 'content',
});

const verticalTabs: TabItem[] = [
  { id: 'content', label: 'Content', count: 3 },
  { id: 'intro', label: 'Introduction' },
  { id: 'endMessage', label: 'End Message' },
];

const filterTabs: TabItem[] = [
  { id: 'all', label: 'All Items', count: 42 },
  { id: 'active', label: 'Active', count: 18 },
  { id: 'archived', label: 'Archived', count: 24 },
];
</script>

<template>
  <Story title="Components/Tabs/AppVTabs">
    <Variant title="Basic">
      <div class="w-[200px]">
        <AppVTabs v-model="state.selectedTab" :items="verticalTabs" />
      </div>
    </Variant>

    <Variant title="Filter Example">
      <div class="flex gap-4">
        <div class="w-[200px]">
          <AppVTabs v-model="state.selectedTab" :items="filterTabs" />
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
