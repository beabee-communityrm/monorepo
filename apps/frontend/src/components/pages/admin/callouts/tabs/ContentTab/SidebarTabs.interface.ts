import type { ItemStatus } from '@beabee/beabee-common';

import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import type { AppStepperStep } from '@type';
import type { Component, Raw } from 'vue';

import type { ContentFormTabData } from './SidebarTabContent/ContentFormTab.vue';
import type { EndMessageTabData } from './SidebarTabContent/EndMessageTab.vue';
import type { IntroMessageTabData } from './SidebarTabContent/IntroMessageTab.vue';

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
  /** The name of the tab */
  name: string;
  /** Slide information */
  slides: FormBuilderSlide[];
  currentSlide: FormBuilderSlide;
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
  /** The end message tab */
  endMessage: EndMessageTabData;
}

export interface SidebarTabContentProps {
  slides: FormBuilderSlide[];
  currentSlide: FormBuilderSlide;
  currentTab: SidebarTab<SidebarTabsData[keyof SidebarTabsData]>;
  status: ItemStatus | undefined;
}
