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
import ResponseDisplayTab from './tabs/ResponseDisplayTab.vue';
import ContentTab from './tabs/ContentTab/ContentTab.vue';
import TitleAndImageTab from './tabs/TitleAndImageTab.vue';
import TranslationsTab from './tabs/TranslationsTab.vue';

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
    name: t('callout.builder.tabs.content.title'),
    validated: false,
    error: false,
    component: markRaw(ContentTab),
    data: props.data.content,
  },
  titleAndImage: {
    name: t('callout.builder.tabs.titleAndImage.title'),
    validated: false,
    error: false,
    component: markRaw(TitleAndImageTab),
    data: props.data.titleAndImage,
  },
  settings: {
    name: t('callout.builder.tabs.settings.title'),
    validated: false,
    error: false,
    component: markRaw(SettingsTab),
    data: props.data.settings,
  },
  responseDisplay: {
    name: t('callout.builder.tabs.responseDisplay.title'),
    validated: false,
    error: false,
    component: markRaw(ResponseDisplayTab),
    data: props.data.responseDisplay,
  },
  translations: {
    name: t('callout.builder.tabs.translations.title'),
    validated: false,
    error: false,
    component: markRaw(TranslationsTab),
    data: props.data.translations,
  },
});

/**
 * Define the order of tabs
 */
const tabsInOrder = [
  tabs.content,
  tabs.titleAndImage,
  tabs.settings,
  tabs.responseDisplay,
  tabs.translations,
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
</script>
