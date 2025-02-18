import type { Raw } from 'vue';
import type { Component } from 'vue';
import type { LocaleProp, AppStepperStep } from '@type';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';

/**
 * Props for the form builder content tab in the sidebar
 */
export interface ContentFormTabProps {
  /** Current slide being edited */
  currentSlide: FormBuilderSlide;
  /** All slides in the form */
  slides: FormBuilderSlide[];
  /** Show advanced options in form builder */
  showAdvanced: boolean;
  /** Whether the form has multiple locales */
  hasLocales: boolean;
  /** Component text translations */
  componentText: Record<string, LocaleProp>;
  /** Available locales */
  locales: string[];
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
 * Props for the intro message tab in the sidebar
 */
export interface IntroMessageTabProps {
  /** Intro text shown at the beginning of the form */
  introText: LocaleProp;
}

/**
 * Props for the title and image tab in the sidebar
 */
export interface TitleAndImageTabProps {
  title: LocaleProp;
  description: LocaleProp;
  coverImageURL: string;
  autoSlug: string;
  useCustomSlug: boolean;
  slug: string;
  overrideShare: boolean;
  shareTitle: LocaleProp;
  shareDescription: LocaleProp;
}

/**
 * Combined props for all sidebar tabs
 */
export interface SidebarTabsProps {
  content: ContentFormTabProps;
  intro: IntroMessageTabProps;
  titleAndImage: TitleAndImageTabProps;
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
