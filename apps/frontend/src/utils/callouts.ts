import {
  flattenComponents,
  ItemStatus,
  type CalloutComponentSchema,
  type CalloutComponentInputSelectableRadioSchema,
  type GetCalloutSlideSchema,
  type SetCalloutSlideSchema,
  type CalloutVariantData,
  type CalloutVariantNavigationData,
  type GetCalloutDataWith,
  CalloutAccess,
  CalloutCaptcha,
  type CreateCalloutData,
} from '@beabee/beabee-common';
import { format } from 'date-fns';
import { computed } from 'vue';

import env from '../env';
import { i18n } from '../lib/i18n';

import type { LocaleProp } from '@type';
import type {
  FormBuilderNavigation,
  FormBuilderSlide,
} from '@components/form-builder/form-builder.interface';
import type { ContentTabData } from '@components/pages/admin/callouts/tabs/ContentTab/ContentTab.vue';
import type { FilterItem, FilterItems } from '@type';
import type { CalloutHorizontalTabsData } from '@components/pages/admin/callouts/CalloutHorizontalTabs.interface';
import type { TitleAndImageTabData } from '@components/pages/admin/callouts/tabs/TitleAndImageTab.vue';
import type { TranslationsTabData } from '@components/pages/admin/callouts/tabs/TranslationsTab.vue';
import type { SettingsTabData } from '@components/pages/admin/callouts/tabs/SettingsTab.vue';

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
 * Creates a new slide schema with a unique ID and default navigation
 *
 * @param no - The slide number to use in the title
 * @returns A new FormBuilderSlide object with default values
 */
export function getSlideSchema(no: number): FormBuilderSlide {
  const id = 'slide' + Math.random().toString(36).substring(2, 8);
  return {
    id,
    title: t('callout.builder.navigation.slideNo', { no }),
    components: [],
    navigation: {
      nextText: { default: t('actions.next') },
      prevText: { default: t('actions.back') },
      nextSlideId: '',
      submitText: { default: t('actions.submit') },
    },
  };
}

const textFields = [
  'title',
  'excerpt',
  'intro',
  'thanksTitle',
  'thanksText',
  'thanksRedirect',
  'shareTitle',
  'shareDescription',
] as const;

/**
 * Converts variant data into a format suitable for the form tabs
 *
 * This function transforms the callout variant data into a structure where each text field
 * is represented as a LocaleProp object with translations for each variant.
 *
 * @param variants - The variant data from the callout
 * @returns An object with text fields as keys and LocaleProp objects as values
 */
function convertVariantsForSteps(
  variants: Record<string, CalloutVariantData> | undefined
): Record<(typeof textFields)[number], LocaleProp> {
  const result: Record<(typeof textFields)[number], LocaleProp> = {
    title: { default: '' },
    excerpt: { default: '' },
    intro: { default: '' },
    thanksText: { default: '' },
    thanksTitle: { default: '' },
    thanksRedirect: { default: '' },
    shareTitle: { default: '' },
    shareDescription: { default: '' },
  };

  if (!variants) return result;

  for (const variant in variants) {
    for (const field of textFields) {
      result[field][variant] = variants[variant][field] || '';
    }
  }

  return result;
}

/**
 * Converts slide data and variants into a format suitable for the form builder
 *
 * This function transforms the callout slides and their variants into a structure
 * that can be used by the form builder, including localized navigation text and component text.
 *
 * @param slidesIn - The slides from the callout
 * @param variants - The variant data from the callout
 * @returns An object containing the transformed slides and component text
 */
function convertSlidesForSteps(
  slidesIn: GetCalloutSlideSchema[] | undefined,
  variants: Record<string, CalloutVariantData> | undefined
): { slides: FormBuilderSlide[]; componentText: Record<string, LocaleProp> } {
  if (!slidesIn) {
    return { slides: [getSlideSchema(1)], componentText: {} };
  }

  const componentText: Record<string, LocaleProp> = {};
  const slides = slidesIn.map((slide) => {
    const navigation: FormBuilderNavigation = {
      prevText: { default: '' },
      nextText: { default: '' },
      submitText: { default: '' },
      nextSlideId: slide.navigation.nextSlideId,
    };

    if (variants) {
      for (const variant in variants) {
        for (const field of ['prevText', 'nextText', 'submitText'] as const) {
          navigation[field][variant] =
            variants[variant].slideNavigation[slide.id][field];
        }

        for (const text in variants[variant].componentText) {
          componentText[text] ||= { default: '' };
          componentText[text][variant] = variants[variant].componentText[text];
        }
      }
    }

    return { ...slide, navigation };
  });

  return { slides, componentText };
}

/**
 * Converts a callout object to the tab-based format used in the editor
 *
 * This function transforms a callout from the API format into the structure
 * used by the editor tabs, including content, title and image, settings,
 * dates, and translations.
 *
 * @param callout - The callout data from the API
 * @returns The callout data structured for the editor tabs
 */
export function convertCalloutToTabs(
  callout?: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variants'>
): CalloutHorizontalTabsData {
  const variants = convertVariantsForSteps(callout?.variants);

  const locales = callout
    ? Object.keys(callout.variants).filter((v) => v !== 'default')
    : [];

  const { slides, componentText } = convertSlidesForSteps(
    callout?.formSchema.slides,
    callout?.variants
  );

  const sharedSettings = {
    captchaEnabled: callout?.captcha !== CalloutCaptcha.None,
    captchaForMembers: callout?.captcha === CalloutCaptcha.All,
    locales,
    channels: callout?.channels || null,
  };

  const settings: SettingsTabData = env.cnrMode
    ? ({
        ...sharedSettings,
        openToEveryone: true,
        collectMemberInfo: false,
        collectGuestInfo: false,
        showOnUserDashboards: false,
        responseSettings: 'multiple',
        hasStartDate: false,
        hasEndDate: false,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
      } as const)
    : ({
        ...sharedSettings,
        openToEveryone: callout?.access !== CalloutAccess.Member,
        collectMemberInfo: callout?.access !== CalloutAccess.OnlyAnonymous,
        collectGuestInfo: callout?.access === CalloutAccess.Guest,
        showOnUserDashboards: !callout?.hidden,
        responseSettings: callout?.allowMultiple
          ? 'multiple'
          : callout?.allowUpdate
            ? 'singleEditable'
            : 'singleNonEditable',
        hasStartDate: callout?.status === ItemStatus.Scheduled,
        hasEndDate: !!callout?.expires,
        startDate: callout?.starts ? format(callout.starts, 'yyyy-MM-dd') : '',
        startTime: callout?.starts ? format(callout.starts, 'HH:mm') : '',
        endDate: callout?.expires ? format(callout.expires, 'yyyy-MM-dd') : '',
        endTime: callout?.expires ? format(callout.expires, 'HH:mm') : '',
      } as const);

  const content: ContentTabData = {
    slides,
    componentText,
    sidebarTabs: {
      content: {
        currentSlide: slides[0],
        slides,
        componentText,
        showAdvanced: false,
      },
      intro: {
        introText: variants.intro,
      },
      endMessage: {
        whenFinished: callout?.thanksRedirect ? 'redirect' : 'message',
        thankYouTitle: variants.thanksTitle,
        thankYouText: variants.thanksText,
        thankYouRedirect: variants.thanksRedirect,
      },
    },
  };

  const titleAndImage: TitleAndImageTabData = {
    title: variants.title,
    description: variants.excerpt,
    coverImageURL: callout?.image || '',
    autoGenerateSlug: !callout,
    autoSlug: '',
    slug: callout?.slug || '',
    overrideShare: !!callout?.shareTitle,
    shareTitle: variants.shareTitle,
    shareDescription: variants.shareDescription,
  };

  // Translations tab data
  const translations: TranslationsTabData = {
    componentText,
  };

  return {
    content,
    titleAndImage,
    settings,
    translations,
    responseDisplay: {
      showResponses: !!callout?.responseViewSchema,
      responseViews: [
        ...(callout?.responseViewSchema?.gallery ? ['gallery' as const] : []),
        ...(callout?.responseViewSchema?.map ? ['map' as const] : []),
      ],
      responseBuckets: callout?.responseViewSchema?.buckets || [],
      responseTitleProp: callout?.responseViewSchema?.titleProp || '',
      responseImageProp: callout?.responseViewSchema?.imageProp || '',
      responseLinks: callout?.responseViewSchema?.links || [],
      mapSchema: callout?.responseViewSchema?.map || {
        style: '',
        bounds: [
          [-180, -90],
          [180, 90],
        ],
        center: [0, 0],
        initialZoom: 3,
        maxZoom: 18,
        minZoom: 1,
        addressProp: '',
        addressPattern: '',
        addressPatternProp: '',
      },
      imageFilter: callout?.responseViewSchema?.imageFilter || '',
    },
  };
}

/**
 * Converts the tab-based format back to variant data for the API
 *
 * This function transforms the editor tab data into the variant structure
 * expected by the API, including translations for all text fields and components.
 *
 * @param tabs - The callout data from the editor tabs
 * @returns The variant data for the API
 */
function convertVariantsForCallout(
  tabs: CalloutHorizontalTabsData
): Record<string, CalloutVariantData> {
  const variants: Record<string, CalloutVariantData> = {};
  for (const variant of [...tabs.settings.locales, 'default']) {
    const slideNavigation: Record<string, CalloutVariantNavigationData> = {};

    for (const slide of tabs.content.slides) {
      slideNavigation[slide.id] = {
        nextText: slide.navigation.nextText[variant] || '',
        prevText: slide.navigation.prevText[variant] || '',
        submitText: slide.navigation.submitText[variant] || '',
      };
    }

    // Use translations tab data for component text
    const componentText: Record<string, string> = {};
    for (const key in tabs.translations.componentText) {
      componentText[key] = tabs.translations.componentText[key][variant] || '';
    }

    variants[variant] = {
      title: tabs.titleAndImage.title[variant] || '',
      excerpt: tabs.titleAndImage.description[variant] || '',
      intro: tabs.content.sidebarTabs.intro.introText[variant] || '',
      ...(tabs.content.sidebarTabs.endMessage.whenFinished === 'redirect'
        ? {
            thanksText: '',
            thanksTitle: '',
            thanksRedirect:
              tabs.content.sidebarTabs.endMessage.thankYouRedirect[variant] ||
              '',
          }
        : {
            thanksText:
              tabs.content.sidebarTabs.endMessage.thankYouText[variant] || '',
            thanksTitle:
              tabs.content.sidebarTabs.endMessage.thankYouTitle[variant] || '',
            thanksRedirect: null,
          }),
      ...(tabs.titleAndImage.overrideShare
        ? {
            shareTitle: tabs.titleAndImage.shareTitle[variant] || '',
            shareDescription:
              tabs.titleAndImage.shareDescription[variant] || '',
          }
        : {
            shareTitle: null,
            shareDescription: null,
          }),
      slideNavigation,
      componentText,
    };
  }

  return variants;
}

/**
 * Converts the tab-based slide format to the API format
 *
 * @param tabs - The callout data from the editor tabs
 * @returns The slides in the format expected by the API
 */
function convertSlidesForCallout(
  tabs: CalloutHorizontalTabsData
): SetCalloutSlideSchema[] {
  return tabs.content.slides.map((slide) => ({
    ...slide,
    navigation: {
      nextSlideId: slide.navigation.nextSlideId,
    },
  }));
}

/**
 * Converts the tab-based editor data to the format expected by the API for creating or updating a callout
 *
 * This function transforms the complete editor tab data into the structure
 * required by the API, including slides, variants, settings, and dates.
 *
 * @param tabs - The callout data from the editor tabs
 * @returns The callout data in the format expected by the API
 */
export function convertStepsToCallout(
  tabs: CalloutHorizontalTabsData
): CreateCalloutData {
  const slug = tabs.titleAndImage.autoGenerateSlug
    ? tabs.titleAndImage.autoSlug
    : tabs.titleAndImage.slug;

  const slides = convertSlidesForCallout(tabs);
  const variants = convertVariantsForCallout(tabs);

  return {
    slug: slug || undefined,
    image: tabs.titleAndImage.coverImageURL,
    formSchema: { slides },
    responseViewSchema: tabs.responseDisplay.showResponses
      ? {
          buckets: tabs.responseDisplay.responseBuckets,
          titleProp: tabs.responseDisplay.responseTitleProp,
          imageProp: tabs.responseDisplay.responseImageProp,
          // TODO: Remove this once the image filter is removed from the API
          imageFilter: tabs.responseDisplay.imageFilter,
          gallery: tabs.responseDisplay.responseViews.includes('gallery'),
          links: tabs.responseDisplay.responseLinks,
          map: tabs.responseDisplay.responseViews.includes('map')
            ? {
                ...tabs.responseDisplay.mapSchema,
                addressPattern: tabs.responseDisplay.mapSchema
                  .addressPatternProp
                  ? tabs.responseDisplay.mapSchema.addressPattern
                  : '',
              }
            : null,
        }
      : null,
    starts: tabs.settings.hasStartDate
      ? new Date(tabs.settings.startDate + 'T' + tabs.settings.startTime)
      : new Date(),
    expires: tabs.settings.hasEndDate
      ? new Date(tabs.settings.endDate + 'T' + tabs.settings.endTime)
      : null,
    allowMultiple: tabs.settings.responseSettings === 'multiple',
    allowUpdate: tabs.settings.responseSettings === 'singleEditable',
    hidden: !tabs.settings.showOnUserDashboards,
    captcha: tabs.settings.captchaEnabled
      ? tabs.settings.captchaForMembers
        ? CalloutCaptcha.All
        : CalloutCaptcha.Guest
      : CalloutCaptcha.None,
    access: tabs.settings.openToEveryone
      ? tabs.settings.collectMemberInfo
        ? tabs.settings.collectGuestInfo
          ? CalloutAccess.Guest
          : CalloutAccess.Anonymous
        : CalloutAccess.OnlyAnonymous
      : CalloutAccess.Member,
    variants,
    channels: tabs.settings.channels,
  };
}

function convertValuesToOptions(
  values: { value: string; label: string }[]
): { id: string; label: string }[] {
  return values.map(({ value, label }) => ({ id: value, label }));
}

function convertComponentToFilter(
  component: CalloutComponentSchema & { fullKey: string }
): FilterItem {
  const baseItem = {
    label: component.label || component.fullKey,
    nullable: true,
  };

  switch (component.type) {
    case 'checkbox':
      return { ...baseItem, type: 'boolean', nullable: false };

    case 'number':
      return { ...baseItem, type: 'number' };

    case 'select':
      return {
        ...baseItem,
        type: 'enum',
        options: convertValuesToOptions(component.data.values),
      };

    case 'selectboxes':
    case 'radio':
      return {
        ...baseItem,
        type: component.type === 'radio' ? 'enum' : 'array',
        options: convertValuesToOptions(component.values),
      };

    case 'textarea':
      return { ...baseItem, type: 'blob' };

    default:
      return { ...baseItem, type: 'text' };
  }
}

export function convertComponentsToFilters(
  components: (CalloutComponentSchema & { fullKey: string })[],
  prefix: string
): FilterItems {
  const items = components.map((c) => {
    return [`${prefix}.${c.fullKey}`, convertComponentToFilter(c)] as const;
  });

  return Object.fromEntries(items);
}

function isDecisionComponent(
  component: CalloutComponentSchema
): component is CalloutComponentInputSelectableRadioSchema {
  return (
    component.type === 'radio' && component.values.some((v) => v.nextSlideId)
  );
}

export function getDecisionComponent(
  components: CalloutComponentSchema[]
): CalloutComponentInputSelectableRadioSchema | undefined {
  return flattenComponents(components).find(isDecisionComponent);
}
