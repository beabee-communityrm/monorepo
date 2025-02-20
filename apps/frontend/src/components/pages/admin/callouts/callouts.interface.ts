import { computed, type Raw, type Component } from 'vue';
import i18n from '../../../../lib/i18n';
import type { LocaleProp, AppStepperStep } from '@type';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import type {
  CalloutCaptcha,
  CalloutChannel,
  CalloutMapSchema,
} from '@beabee/beabee-common';
import type { SidebarTabsData } from './tabs/ContentTab/sidebar-tabs.interface';

const { t } = i18n.global;

/**
 * Predefined response buckets for callout responses
 */
export const buckets = computed(() => [
  { id: '', label: t('calloutResponseBuckets.inbox') },
  { id: 'verified', label: t('calloutResponseBuckets.verified') },
  { id: 'trash', label: t('calloutResponseBuckets.trash') },
]);

/**
 * Props for the content tab, which contains the form builder and end message configuration
 */
export interface ContentTabProps {
  /** Form builder slides containing the form components */
  slides: FormBuilderSlide[];
  /** Translations for component texts */
  componentText: Record<string, LocaleProp>;
  /** Configuration for the sidebar tabs within the content tab */
  sidebarTabs: SidebarTabsData;
}

/**
 * Props for the settings tab, which contains callout configuration options
 */
export interface SettingsTabProps {
  whoCanTakePart: 'members' | 'everyone';
  allowAnonymousResponses: 'none' | 'guests' | 'all';
  requireCaptcha: CalloutCaptcha;
  showOnUserDashboards: boolean;
  multipleResponses: boolean;
  usersCanEditAnswers: boolean;
  showResponses: boolean;
  responseViews: ('map' | 'gallery')[];
  responseBuckets: string[];
  responseTitleProp: string;
  responseImageProp: string;
  responseImageFilter: string;
  responseLinks: { text: string; url: string }[];
  mapSchema: CalloutMapSchema;
  locales: string[];
  channels: CalloutChannel[] | null;
}

/**
 * Props for the dates tab, which contains scheduling information
 */
export interface DateAndDurationTabProps {
  hasEndDate: boolean;
  startNow: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

/**
 * Combined props for all main callout tabs
 */
export interface CalloutTabsProps {
  content: ContentTabProps;
  settings: SettingsTabProps;
  dates: DateAndDurationTabProps;
}

/**
 * Base interface for a callout tab component
 */
export interface CalloutTab<T> extends AppStepperStep {
  validated: boolean;
  error: boolean;
  data: T;
  component: Raw<Component>;
}

/**
 * Type for the complete callout tabs structure
 */
export type CalloutTabs = {
  [P in keyof CalloutTabsProps]: CalloutTab<CalloutTabsProps[P]>;
};

/**
 * Currently unused
 */
export interface MailchimpSyncStepProps {
  useMailchimpSync: boolean;
}
