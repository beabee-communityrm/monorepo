import type { Raw, Component } from 'vue';
import type { ItemStatus } from '@beabee/beabee-common';
import type { AppStepperStep } from '@type';
import type { ContentFormTabData } from './SidebarTabContent/ContentFormTab.vue';
import type { IntroMessageTabData } from './SidebarTabContent/IntroMessageTab.vue';
import type { TitleAndImageTabData } from './SidebarTabContent/TitleAndImageTab.vue';
import type { EndMessageTabData } from './SidebarTabContent/EndMessageTab.vue';

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

export interface SidebarTabContentProps {
  currentTab: SidebarTab<SidebarTabsData[keyof SidebarTabsData]>;
  status: ItemStatus | undefined;
  locales: string[];
}
