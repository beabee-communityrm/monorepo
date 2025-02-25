<template>
  <div class="flex max-h-full min-h-0 flex-1 flex-col">
    <CalloutHorizontalTabsNavigation
      v-model:selected-tab="selectedTabName"
      :tabs-in-order="tabsInOrder"
    />

    <CalloutHorizontalTabsContent
      :selected-tab="selectedTab"
      :tabs-in-order="tabsInOrder"
      :status="status"
      :tabs="tabs"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, markRaw, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { type ItemStatus } from '@beabee/beabee-common';

import CalloutHorizontalTabsNavigation from './CalloutHorizontalTabsNavigation.vue';
import CalloutHorizontalTabsContent from './CalloutHorizontalTabsContent.vue';
import type {
  CalloutHorizontalTabsData,
  CalloutHorizontalTabs,
} from './CalloutHorizontalTabs.interface';

// Tab Components
import SettingsTab from './tabs/SettingsTab.vue';
import DatesAndDurationTab from './tabs/DatesAndDurationTab.vue';
import ContentTab from './tabs/ContentTab/ContentTab.vue';

export interface CalloutProps {
  data: CalloutHorizontalTabsData;
  status: ItemStatus | undefined;
}

const props = defineProps<CalloutProps>();
const { t } = useI18n();

/**
 * Initialize tabs with their components and data
 */
const tabs = reactive<CalloutHorizontalTabs>({
  content: {
    name: t('createCallout.tabs.content.title'),
    validated: false,
    error: false,
    component: markRaw(ContentTab),
    data: props.data.content,
  },
  settings: {
    name: t('createCallout.tabs.settings.title'),
    validated: false,
    error: false,
    component: markRaw(SettingsTab),
    data: props.data.settings,
  },
  dates: {
    name: t('createCallout.tabs.dates.title'),
    validated: false,
    error: false,
    component: markRaw(DatesAndDurationTab),
    data: props.data.dates,
  },
});

/**
 * Define the order of tabs
 */
const tabsInOrder = [tabs.content, tabs.settings, tabs.dates];

/**
 * Tab selection management
 */
const selectedTabName = ref(tabsInOrder[0].name);

const selectedTab = computed(
  () =>
    tabsInOrder.find((step) => step.name === selectedTabName.value) ||
    tabsInOrder[0]
);
</script>
