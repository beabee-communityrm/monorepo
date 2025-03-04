<script lang="ts" setup>
import { reactive } from 'vue';
import AppTabCard from './AppTabCard.vue';
import type { TabItem } from './tabs.interface';

const state = reactive({
  selectedTab: 'en',
});

const languageTabs: TabItem[] = [
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' },
  { id: 'pt', label: 'Português' },
];

const tabsWithCounts: TabItem[] = [
  { id: 'pending', label: 'Pending', count: 3 },
  { id: 'approved', label: 'Approved', count: 12 },
  { id: 'rejected', label: 'Rejected', count: 1 },
];
</script>

<template>
  <Story title="Components/Tabs/AppTabCard">
    <Variant title="Language Tabs">
      <AppTabCard
        class="bg-grey-lighter"
        v-model="state.selectedTab"
        :items="languageTabs"
      >
        <template #default="{ selected }">
          <div class="min-h-[100px]">
            <p v-if="selected === 'en'">English content goes here</p>
            <p v-else-if="selected === 'de'">Deutscher Inhalt kommt hier</p>
            <p v-else-if="selected === 'pt'">Conteúdo em português aqui</p>
          </div>
        </template>
      </AppTabCard>
    </Variant>

    <Variant title="With Counts">
      <AppTabCard v-model="state.selectedTab" :items="tabsWithCounts">
        <template #default="{ selected }">
          <div class="min-h-[100px]">
            <p>Showing content for: {{ selected }}</p>
          </div>
        </template>
      </AppTabCard>
    </Variant>

    <Variant title="Form Example">
      <AppTabCard v-model="state.selectedTab" :items="languageTabs">
        <template #default="{ selected }">
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium">Title</label>
              <input
                type="text"
                class="w-full rounded-md border border-primary-20 px-3 py-2"
                :placeholder="`Enter title in ${selected}`"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium">Description</label>
              <textarea
                class="w-full rounded-md border border-primary-20 px-3 py-2"
                :placeholder="`Enter description in ${selected}`"
                rows="3"
              />
            </div>
          </div>
        </template>
      </AppTabCard>
    </Variant>
  </Story>
</template>
