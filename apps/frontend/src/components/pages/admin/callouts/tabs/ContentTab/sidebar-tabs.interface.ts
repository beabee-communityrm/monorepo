import type { Raw } from 'vue';
import type { Component } from 'vue';
import type { LocaleProp, AppStepperStep } from '@type';
// import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';

export interface EndMessageTabProps {
  whenFinished: 'message' | 'redirect';
  thankYouTitle: LocaleProp;
  thankYouText: LocaleProp;
  thankYouRedirect: LocaleProp;
}

export interface ContentFormTabProps {
  // TODO: Move some props from ContentTabProps here
}

export interface SidebarTabsProps {
  content: ContentFormTabProps;
  endMessage: EndMessageTabProps;
}

export interface SidebarTab<T> extends AppStepperStep {
  validated: boolean;
  error: boolean;
  data: T;
  component: Raw<Component>;
}

export type SidebarTabs = {
  [P in keyof SidebarTabsProps]: SidebarTab<SidebarTabsProps[P]>;
};
