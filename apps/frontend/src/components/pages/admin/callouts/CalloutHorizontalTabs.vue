<template>
  <div class="flex h-full flex-col overflow-y-hidden">
    <AppTabs
      class="flex-none"
      :items="tabItems"
      :selected="selectedTab.name"
      @tab-click="handleTabClick"
    />
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
import { ItemStatus } from '@beabee/beabee-common';
import { ref, computed, markRaw, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import AppTabs from '../../../tabs/AppTabs.vue';
import type { CalloutTabsProps, CalloutTabs } from './callouts.interface';
import type { TabItem } from '../../../tabs/tabs.interface';

import StepSettings from './tabs/SettingsTab.vue';
import StepTitleAndImage from './tabs/TitleAndImageTab.vue';
import StepDatesAndDuration from './tabs/DatesAndDurationTab.vue';
import StepContent from './tabs/ContentTab/ContentTab.vue';

const props = defineProps<{
  tabsProps: CalloutTabsProps;
  status: ItemStatus | undefined;
}>();

const { t } = useI18n();

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

const tabsInOrder = [
  tabs.content,
  tabs.titleAndImage,
  tabs.settings,
  tabs.dates,
];

const selectedTabName = ref(tabsInOrder[0].name);

const selectedTab = computed(
  () =>
    tabsInOrder.find((step) => step.name === selectedTabName.value) ||
    tabsInOrder[0]
);

const handleTabClick = (tabId: string) => {
  selectedTabName.value = tabId;
};

const tabItems = computed<TabItem[]>(() =>
  tabsInOrder.map((step) => ({
    id: step.name,
    label: step.name,
    to: '',
  }))
);
</script>
