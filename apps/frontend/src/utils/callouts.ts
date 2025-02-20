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
import type { CalloutHorizontalTabsData } from '@components/pages/admin/callouts/CalloutHorizontalTabs.vue';
import { computed } from 'vue';
import type { FilterItem, FilterItems } from '@type';

import env from '../env';
import { i18n } from '../lib/i18n';

import type { LocaleProp } from '@type';
import type {
  FormBuilderNavigation,
  FormBuilderSlide,
} from '@components/form-builder/form-builder.interface';
import type { ContentTabData } from '@components/pages/admin/callouts/tabs/ContentTab/ContentTab.vue';
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
 */
export function getSlideSchema(no: number): FormBuilderSlide {
  const id = 'slide' + Math.random().toString(36).substring(2, 8);
  return {
    id,
    title: t('calloutBuilder.slideNo', { no }),
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

export function convertCalloutToTabs(
  callout?: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variants'>
): CalloutHorizontalTabsData {
  const settings = env.cnrMode
    ? ({
        whoCanTakePart: 'everyone',
        allowAnonymousResponses: 'guests',
        showOnUserDashboards: false,
        usersCanEditAnswers: false,
        multipleResponses: true,
      } as const)
    : ({
        whoCanTakePart:
          !callout || callout.access === 'member' ? 'members' : 'everyone',
        allowAnonymousResponses:
          callout?.access === 'anonymous'
            ? 'guests'
            : callout?.access === 'only-anonymous'
              ? 'all'
              : 'none',
        showOnUserDashboards: !callout?.hidden,
        usersCanEditAnswers: callout?.allowUpdate || false,
        multipleResponses: callout?.allowMultiple || false,
      } as const);

  const variants = convertVariantsForSteps(callout?.variants);

  const content: ContentTabData = {
    slides: convertSlidesForSteps(callout?.formSchema.slides, callout?.variants)
      .slides,
    componentText: convertSlidesForSteps(
      callout?.formSchema.slides,
      callout?.variants
    ).componentText,
    sidebarTabs: {
      content: {
        currentSlide: convertSlidesForSteps(
          callout?.formSchema.slides,
          callout?.variants
        ).slides[0],
        slides: convertSlidesForSteps(
          callout?.formSchema.slides,
          callout?.variants
        ).slides,
        componentText: convertSlidesForSteps(
          callout?.formSchema.slides,
          callout?.variants
        ).componentText,
        showAdvanced: false,
        hasLocales: callout?.variants
          ? Object.keys(callout.variants).length > 1
          : false,
        locales: callout?.variants
          ? Object.keys(callout.variants).filter((v) => v !== 'default')
          : [],
      },
      titleAndImage: {
        title: variants.title,
        description: variants.excerpt,
        coverImageURL: callout?.image || '',
        autoGenerateSlug: !callout,
        autoSlug: '',
        slug: callout?.slug || '',
        overrideShare: !!callout?.shareTitle,
        shareTitle: variants.shareTitle,
        shareDescription: variants.shareDescription,
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

  return {
    content,
    settings: {
      ...settings,
      requireCaptcha: callout?.captcha || CalloutCaptcha.None,
      showResponses: !!callout?.responseViewSchema,
      responseViews: [
        ...(callout?.responseViewSchema?.gallery ? ['gallery' as const] : []),
        ...(callout?.responseViewSchema?.map ? ['map' as const] : []),
      ],
      responseBuckets: callout?.responseViewSchema?.buckets || [],
      responseTitleProp: callout?.responseViewSchema?.titleProp || '',
      responseImageProp: callout?.responseViewSchema?.imageProp || '',
      responseImageFilter: callout?.responseViewSchema?.imageFilter || '',
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
      locales: callout
        ? Object.keys(callout.variants).filter((v) => v !== 'default')
        : [],
      channels: callout?.channels || null,
    },
    dates: {
      startNow: !callout || callout.status === ItemStatus.Draft,
      hasEndDate: !!callout?.expires,
      startDate: callout?.starts ? format(callout.starts, 'yyyy-MM-dd') : '',
      startTime: callout?.starts ? format(callout.starts, 'HH:mm') : '',
      endDate: callout?.expires ? format(callout.expires, 'yyyy-MM-dd') : '',
      endTime: callout?.expires ? format(callout.expires, 'HH:mm') : '',
    },
  };
}

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

    const componentText: Record<string, string> = {};
    for (const key in tabs.content.componentText) {
      componentText[key] = tabs.content.componentText[key][variant] || '';
    }

    variants[variant] = {
      title: tabs.content.sidebarTabs.titleAndImage.title[variant] || '',
      excerpt:
        tabs.content.sidebarTabs.titleAndImage.description[variant] || '',
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
      ...(tabs.content.sidebarTabs.titleAndImage.overrideShare
        ? {
            shareTitle:
              tabs.content.sidebarTabs.titleAndImage.shareTitle[variant] || '',
            shareDescription:
              tabs.content.sidebarTabs.titleAndImage.shareDescription[
                variant
              ] || '',
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

export function convertStepsToCallout(
  tabs: CalloutHorizontalTabsData
): CreateCalloutData {
  const slug = tabs.content.sidebarTabs.titleAndImage.autoGenerateSlug
    ? tabs.content.sidebarTabs.titleAndImage.autoSlug
    : tabs.content.sidebarTabs.titleAndImage.slug;

  const slides = convertSlidesForCallout(tabs);
  const variants = convertVariantsForCallout(tabs);

  return {
    slug: slug || undefined,
    image: tabs.content.sidebarTabs.titleAndImage.coverImageURL,
    formSchema: { slides },
    responseViewSchema: tabs.settings.showResponses
      ? {
          buckets: tabs.settings.responseBuckets,
          titleProp: tabs.settings.responseTitleProp,
          imageProp: tabs.settings.responseImageProp,
          imageFilter: tabs.settings.responseImageFilter,
          gallery: tabs.settings.responseViews.includes('gallery'),
          links: tabs.settings.responseLinks,
          map: tabs.settings.responseViews.includes('map')
            ? {
                ...tabs.settings.mapSchema,
                addressPattern: tabs.settings.mapSchema.addressPatternProp
                  ? tabs.settings.mapSchema.addressPattern
                  : '',
              }
            : null,
        }
      : null,
    starts: tabs.dates.startNow
      ? new Date()
      : new Date(tabs.dates.startDate + 'T' + tabs.dates.startTime),
    expires: tabs.dates.hasEndDate
      ? new Date(tabs.dates.endDate + 'T' + tabs.dates.endTime)
      : null,
    allowMultiple: tabs.settings.multipleResponses,
    allowUpdate:
      !tabs.settings.multipleResponses && tabs.settings.usersCanEditAnswers,
    hidden: !tabs.settings.showOnUserDashboards,
    captcha: tabs.settings.requireCaptcha,
    access:
      tabs.settings.whoCanTakePart === 'members'
        ? CalloutAccess.Member
        : tabs.settings.allowAnonymousResponses === 'none'
          ? CalloutAccess.Guest
          : tabs.settings.allowAnonymousResponses === 'guests'
            ? CalloutAccess.Anonymous
            : CalloutAccess.OnlyAnonymous,
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
