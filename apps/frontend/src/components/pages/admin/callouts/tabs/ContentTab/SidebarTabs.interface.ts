import type { ItemStatus } from '@beabee/beabee-common';
import type { AppStepperStep } from '@beabee/vue';

import type { Component, Raw } from 'vue';

import type { FormBuilderSlide } from '#components/form-builder/form-builder.interface';

import type { CalloutHorizontalTabs } from '../../CalloutHorizontalTabs.interface';
import type {
  ContentFormTabData,
  EmailTabData,
  EndMessageTabData,
  IntroMessageTabData,
} from './SidebarTabContent/';

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
  /** All horizontal tabs data for cross-tab access */
  tabs: CalloutHorizontalTabs;
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
  /** The email tab */
  email: EmailTabData;
  /** The end message tab */
  endMessage: EndMessageTabData;
}

export interface SidebarTabContentProps {
  currentTab: SidebarTab<SidebarTabsData[keyof SidebarTabsData]>;
  slides: FormBuilderSlide[];
  currentSlide: FormBuilderSlide;
  status: ItemStatus | undefined;
  tabs: CalloutHorizontalTabs;
}
