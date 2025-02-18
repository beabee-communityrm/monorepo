import type { Raw } from 'vue';
import type { Component } from 'vue';
import type { LocaleProp, AppStepperStep } from '@type';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';

/**
 * Props for the form builder content tab in the sidebar
 */
export interface ContentFormTabProps {
  /** Form builder slides containing the form components */
  slides: FormBuilderSlide[];
  /** Translations for component texts */
  componentText: Record<string, LocaleProp>;
}

/**
 * Props for the end message tab in the sidebar
 */
export interface EndMessageTabProps {
  /** Whether to show a message or redirect after form submission */
  whenFinished: 'message' | 'redirect';
  /** Title for the thank you message */
  thankYouTitle: LocaleProp;
  /** Content for the thank you message */
  thankYouText: LocaleProp;
  /** Redirect URL after form submission */
  thankYouRedirect: LocaleProp;
}

/**
 * Combined props for all sidebar tabs
 */
export interface SidebarTabsProps {
  content: ContentFormTabProps;
  endMessage: EndMessageTabProps;
}

/**
 * Base interface for a sidebar tab component
 */
export interface SidebarTab<T> extends AppStepperStep {
  validated: boolean;
  error: boolean;
  data: T;
  component: Raw<Component>;
}

/**
 * Type for the complete sidebar tabs structure
 */
export type SidebarTabs = {
  [P in keyof SidebarTabsProps]: SidebarTab<SidebarTabsProps[P]>;
};
