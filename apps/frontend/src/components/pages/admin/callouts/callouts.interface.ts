import { computed, type Raw, type Component } from 'vue';
import i18n from '../../../../lib/i18n';
import type { LocaleProp, AppStepperStep } from '@type';
import type { FormBuilderSlide } from '@components/form-builder/form-builder.interface';
import type {
  CalloutCaptcha,
  CalloutChannel,
  CalloutMapSchema,
} from '@beabee/beabee-common';
import type { SidebarTabsProps } from './tabs/ContentTab/sidebar-tabs.interface';

const { t } = i18n.global;

export const buckets = computed(() => [
  { id: '', label: t('calloutResponseBuckets.inbox') },
  {
    id: 'verified',
    label: t('calloutResponseBuckets.verified'),
  },
  {
    id: 'trash',
    label: t('calloutResponseBuckets.trash'),
  },
]);

export interface ContentTabProps {
  slides: FormBuilderSlide[];
  componentText: Record<string, LocaleProp>;
  sidebarTabs: SidebarTabsProps;
}

export interface TitleAndImageTabProps {
  title: LocaleProp;
  description: LocaleProp;
  coverImageURL: string;
  introText: LocaleProp;
  autoSlug: string;
  useCustomSlug: boolean;
  slug: string;
  overrideShare: boolean;
  shareTitle: LocaleProp;
  shareDescription: LocaleProp;
}

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

export interface MailchimpSyncStepProps {
  useMailchimpSync: boolean;
}

export interface DateAndDurationTabProps {
  hasEndDate: boolean;
  startNow: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
}

export interface CalloutTabsProps {
  content: ContentTabProps;
  titleAndImage: TitleAndImageTabProps;
  settings: SettingsTabProps;
  //mailchimp: MailchimpSyncStepProps;
  dates: DateAndDurationTabProps;
}

export interface CalloutTab<T> extends AppStepperStep {
  validated: boolean;
  error: boolean;
  data: T;
  component: Raw<Component>;
}

export type CalloutTabs = {
  [P in keyof CalloutTabsProps]: CalloutTab<CalloutTabsProps[P]>;
};
