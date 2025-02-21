<template>
  <div class="mb-6">
    <AppTabs
      :items="visibleTabItems"
      :selected="selectedTab"
      :default-tab="defaultTabName"
      orientation="vertical"
      @tab-click="handleTabClick"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, type Raw, type Component } from 'vue';
import AppTabs from '@components/tabs/AppTabs.vue';
import type { TabItem } from '@components/tabs/tabs.interface';
import type { AppStepperStep } from '@type';
import type { ContentFormTabData } from './sidebar-tabs/ContentFormTab.vue';
import type { IntroMessageTabData } from './sidebar-tabs/IntroMessageTab.vue';
import type { TitleAndImageTabData } from './sidebar-tabs/TitleAndImageTab.vue';
import type { EndMessageTabData } from './sidebar-tabs/EndMessageTab.vue';
import type { ItemStatus } from '@beabee/beabee-common';
/**
 * Base interface for a sidebar tab component
 */
export interface SidebarTab<T> extends AppStepperStep {
  validated: boolean;
  error: boolean;
  data: T;
  component: Raw<Component>;
}

export interface SidebarTabProps<T> extends SidebarTab<T> {
  status: ItemStatus | undefined;
  isActive: boolean;
  /** Available locales */
  locales: string[];
}

/**
 * Type for the complete sidebar tabs structure
 */
export type SidebarTabs = {
  [P in keyof SidebarTabsData]: SidebarTab<SidebarTabsData[P]>;
};

/**
 * Combined props for all sidebar tabs
 */
export interface SidebarTabsData {
  /** The content tab */
  content: ContentFormTabData;
  /** The intro message tab */
  intro: IntroMessageTabData;
  /** The title and image tab */
  titleAndImage: TitleAndImageTabData;
  /** The end message tab */
  endMessage: EndMessageTabData;
}

/**
 * Props for the SidebarTabsNavigation component
 */
export interface SidebarTabsNavigationProps {
  /** The currently selected tab name */
  selectedTab: string;
  /** Configuration for all sidebar tabs */
  sidebarTabs: SidebarTabs;
  /** Default tab to fall back to */
  defaultTab?: string;
}

const props = defineProps<SidebarTabsNavigationProps>();

const emit = defineEmits<{
  'update:selectedTab': [value: string];
}>();

/**
 * Computed default tab name from sidebar tabs or fallback to 'content'
 */
const defaultTabName = computed(
  () => props.defaultTab ?? props.sidebarTabs.content.name
);

/**
 * All tab items including the hidden default tab
 */
const allTabItems = computed<TabItem[]>(() => [
  {
    id: props.sidebarTabs.content.name,
    label: props.sidebarTabs.content.name,
    to: '',
    hidden: true,
  },
  {
    id: props.sidebarTabs.titleAndImage.name,
    label: props.sidebarTabs.titleAndImage.name,
    to: '',
  },
  {
    id: props.sidebarTabs.intro.name,
    label: props.sidebarTabs.intro.name,
    to: '',
  },
  {
    id: props.sidebarTabs.endMessage.name,
    label: props.sidebarTabs.endMessage.name,
    to: '',
  },
]);

/**
 * Only visible tab items for display
 */
const visibleTabItems = computed(() =>
  allTabItems.value.filter((item) => !item.hidden)
);

/**
 * Handle tab click event and emit selected tab update
 * If clicking an already selected tab, switch to default tab
 */
const handleTabClick = (tabId: string) => {
  if (tabId === props.selectedTab) {
    emit('update:selectedTab', defaultTabName.value);
  } else {
    emit('update:selectedTab', tabId);
  }
};
</script>
