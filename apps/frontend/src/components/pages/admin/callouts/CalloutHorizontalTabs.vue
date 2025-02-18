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
import { ref, computed, markRaw, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { ItemStatus } from '@beabee/beabee-common';
import AppTabs from '@components/tabs/AppTabs.vue';
import type { TabItem } from '@components/tabs/tabs.interface';
import type { CalloutTabsProps, CalloutTabs } from './callouts.interface';

// Tab Components
import StepSettings from './tabs/SettingsTab.vue';
import StepTitleAndImage from './tabs/TitleAndImageTab.vue';
import StepDatesAndDuration from './tabs/DatesAndDurationTab.vue';
import StepContent from './tabs/ContentTab/ContentTab.vue';

interface Props {
  /** Props for all tabs */
  tabsProps: CalloutTabsProps;
  /** Current status of the callout */
  status: ItemStatus | undefined;
}

const props = defineProps<Props>();
const { t } = useI18n();

/**
 * Initialize tabs with their components and data
 */
const tabs = reactive<CalloutTabs>({
  content: {
    name: t('createCallout.tabs.content.title'),
    validated: false,
    error: false,
    component: markRaw(StepContent),
    data: props.tabsProps.content,
  },
  titleAndImage: {
    name: t('createCallout.tabs.titleAndImage.title'),
    validated: false,
    error: false,
    component: markRaw(StepTitleAndImage),
    data: props.tabsProps.titleAndImage,
  },
  settings: {
    name: t('createCallout.tabs.settings.title'),
    validated: false,
    error: false,
    component: markRaw(StepSettings),
    data: props.tabsProps.settings,
  },
  dates: {
    name: t('createCallout.tabs.dates.title'),
    validated: false,
    error: false,
    component: markRaw(StepDatesAndDuration),
    data: props.tabsProps.dates,
  },
});

/**
 * Define the order of tabs
 */
const tabsInOrder = [
  tabs.content,
  tabs.titleAndImage,
  tabs.settings,
  tabs.dates,
];

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
