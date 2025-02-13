<template>
  <div>
    <AppTabs
      :items="tabItems"
      :selected="selectedStep.name"
      @tab-click="handleTabClick"
    />
    <component
      :is="tab.component"
      v-for="tab in tabsInOrder"
      v-show="selectedStep === tab"
      :key="tab.name"
      v-model:data="tab.data"
      v-model:validated="tab.validated"
      v-model:error="tab.error"
      :is-active="selectedStep === tab"
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
import StepEndMessage from './tabs/EndMessageTab.vue';
import StepDatesAndDuration from './tabs/DatesAndDurationTab.vue';
import StepContent from './tabs/ContentTab.vue';

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
  endMessage: {
    name: t('createCallout.tabs.endMessage.title'),
    validated: false,
    error: false,
    component: markRaw(StepEndMessage),
    data: props.tabsProps.endMessage,
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
  tabs.endMessage,
  tabs.settings,
  tabs.dates,
];

const selectedStepName = ref(tabsInOrder[0].name);

const selectedStep = computed(
  () =>
    tabsInOrder.find((step) => step.name === selectedStepName.value) ||
    tabsInOrder[0]
);

const handleTabClick = (tabId: string) => {
  selectedStepName.value = tabId;
};

const tabItems = computed<TabItem[]>(() =>
  tabsInOrder.map((step) => ({
    id: step.name,
    label: step.name,
    to: '',
    // count: step.validated ? '✓' : undefined,
  }))
);
</script>
