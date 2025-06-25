import type { AppStepperStep } from '@beabee/vue';

import { type Component, type Raw } from 'vue';

import type { ContentTabData } from './tabs/ContentTab/ContentTab.vue';
import type { ResponseDisplayTabData } from './tabs/ResponseDisplayTab.vue';
import type { SettingsTabData } from './tabs/SettingsTab.vue';
import type { TitleAndImageTabData } from './tabs/TitleAndImageTab.vue';
import type { TranslationsTabData } from './tabs/TranslationsTab.vue';

/**
 * Combined props for all main callout tabs
 */
export interface CalloutHorizontalTabsData {
  content: ContentTabData;
  titleAndImage: TitleAndImageTabData;
  settings: SettingsTabData;
  responseDisplay: ResponseDisplayTabData;
  translations: TranslationsTabData;
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
