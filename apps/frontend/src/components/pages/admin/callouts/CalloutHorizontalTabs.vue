<template>
  <div class="flex h-full flex-col overflow-y-hidden">
    <!-- Main Navigation Tabs -->
    <AppTabs
      class="flex-none"
      :items="tabItems"
      :selected="selectedTab.name"
      @tab-click="handleTabClick"
    />

    <!-- Tab Content -->
    <component
      :is="tab.component"
      v-for="tab in tabsInOrder"
      v-show="selectedTab === tab"
      :key="tab.name"
      v-model:data="tab.data"
      v-model:validated="tab.validated"
      v-model:error="tab.error"
      :is-active="selectedTab === tab"
      :status="status"
      :tabs="tabs"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  computed,
  markRaw,
  reactive,
  type Raw,
  type Component,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { ItemStatus } from '@beabee/beabee-common';
import AppTabs from '@components/tabs/AppTabs.vue';
import type { TabItem } from '@components/tabs/tabs.interface';
import type { AppStepperStep } from '@type';

// Tab Components
import SettingsTab, { type SettingsTabData } from './tabs/SettingsTab.vue';
import DatesAndDurationTab, {
  type DateAndDurationTabData,
} from './tabs/DatesAndDurationTab.vue';
import ContentTab, {
  type ContentTabData,
} from './tabs/ContentTab/ContentTab.vue';

/**
 * Combined props for all main callout tabs
 */
export interface CalloutHorizontalTabsData {
  content: ContentTabData;
  settings: SettingsTabData;
  dates: DateAndDurationTabData;
}

/**
 * Base interface for a callout tab component
 */
export interface CalloutHorizontalTab<T> extends AppStepperStep {
  validated: boolean;
  error: boolean;
  data: T;
  component: Raw<Component>;
}

/**
 * Type for the complete callout tabs structure
 */
export type CalloutHorizontalTabs = {
  [P in keyof CalloutHorizontalTabsData]: CalloutHorizontalTab<
    CalloutHorizontalTabsData[P]
  >;
};

/**
 * Props for the CalloutHorizontalTabs component
 */
export interface CalloutHorizontalTabsProps {
  /** Props for all tabs */
  data: CalloutHorizontalTabsData;
  /** Current status of the callout */
  status: ItemStatus | undefined;
}

const props = defineProps<CalloutHorizontalTabsProps>();
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

/**
 * Convert tabs into items for AppTabs component
 */
const tabItems = computed<TabItem[]>(() =>
  tabsInOrder.map((step) => ({
    id: step.name,
    label: step.name,
    to: '',
  }))
);

/**
 * Handle tab click event
 */
const handleTabClick = (tabId: string) => {
  selectedTabName.value = tabId;
};
</script>
