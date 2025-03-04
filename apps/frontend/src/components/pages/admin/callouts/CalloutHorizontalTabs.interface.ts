import { type Raw, type Component } from 'vue';
import type { AppStepperStep } from '@type';
import type { ContentTabData } from './tabs/ContentTab/ContentTab.vue';
import type { SettingsTabData } from './tabs/SettingsTab.vue';
import type { DateAndDurationTabData } from './tabs/DatesAndDurationTab.vue';
import type { TitleAndImageTabData } from './tabs/TitleAndImageTab.vue';

/**
 * Combined props for all main callout tabs
 */
export interface CalloutHorizontalTabsData {
  content: ContentTabData;
  settings: SettingsTabData;
  dates: DateAndDurationTabData;
  titleAndImage: TitleAndImageTabData;
}

/**
 * Base interface for a callout tab component
 */
export interface CalloutHorizontalTab<T> extends AppStepperStep {
  validated: boolean;
  error: boolean;
  data: T;
  component: Raw<Component>;
}

/**
 * Type for the complete callout tabs structure
 */
export type CalloutHorizontalTabs = {
  [P in keyof CalloutHorizontalTabsData]: CalloutHorizontalTab<
    CalloutHorizontalTabsData[P]
  >;
};
