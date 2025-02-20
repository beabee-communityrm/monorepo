import type { Raw } from 'vue';
import type { Component } from 'vue';
import type { LocaleProp, AppStepperStep } from '@type';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';

/**
 * Props for the form builder content tab in the sidebar
 */
export interface ContentFormTabData {
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
export interface EndMessageTabData {
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
export interface IntroMessageTabData {
  /** Intro text shown at the beginning of the form */
  introText: LocaleProp;
}

/**
 * Props for the title and image tab in the sidebar
 */
export interface TitleAndImageTabData {
  /** The title of the callout */
  title: LocaleProp;
  /** The description of the callout */
  description: LocaleProp;
  /** The URL of the cover image */
  coverImageURL: string;
  /** The auto-generated slug of the callout */
  autoSlug: string;
  /** Whether to use a custom slug */
  useCustomSlug: boolean;
  /** The custom slug of the callout */
  slug: string;
  /** Whether to override the share title and description */
  overrideShare: boolean;
  /** The share title of the callout */
  shareTitle: LocaleProp;
  /** The share description of the callout */
  shareDescription: LocaleProp;
}

/**
 * Combined props for all sidebar tabs
 */
export interface SidebarTabsData {
  content: ContentFormTabData;
  intro: IntroMessageTabData;
  titleAndImage: TitleAndImageTabData;
  endMessage: EndMessageTabData;
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
  [P in keyof SidebarTabsData]: SidebarTab<SidebarTabsData[P]>;
};
