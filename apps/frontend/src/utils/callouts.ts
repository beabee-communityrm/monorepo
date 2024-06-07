import {
  flattenComponents,
  ItemStatus,
  type CalloutComponentSchema,
  type CalloutComponentInputSelectableRadioSchema,
  type GetCalloutSlideSchema,
  type SetCalloutSlideSchema,
} from '@beabee/beabee-common';
import { format } from 'date-fns';
import type { CalloutStepsProps } from '@components/pages/admin/callouts/callouts.interface';

import type { FilterItem, FilterItems } from '@type';

import env from '../env';
import i18n from '@lib/i18n';

import type {
  CalloutVariantData,
  CalloutVariantNavigationData,
  CreateCalloutData,
  GetCalloutDataWith,
  LocaleProp,
} from '@type';
import type {
  FormBuilderNavigation,
  FormBuilderSlide,
} from '@components/form-builder/form-builder.interface';

const { t } = i18n.global;

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

  for (const variant in variants) {
    for (const field of textFields) {
      result[field][variant] = variants[variant][field] || '';
    }
  }

  return result;
}

function convertSlidesForSteps(
  slidesIn: GetCalloutSlideSchema[] | undefined,
  variants: Record<string, CalloutVariantData> | undefined
): { slides: FormBuilderSlide[]; componentText: Record<string, LocaleProp> } {
  const componentText: Record<string, LocaleProp> = {};

  if (!slidesIn) return { slides: [getSlideSchema(1)], componentText };

  const slides = slidesIn.map((slide) => {
    const navigation: FormBuilderNavigation = {
      prevText: { default: '' },
      nextText: { default: '' },
      submitText: { default: '' },
      nextSlideId: slide.navigation.nextSlideId,
    };

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

    return { ...slide, navigation };
  });

  return { slides, componentText };
}

export function convertCalloutToSteps(
  callout?: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variants'>
): CalloutStepsProps {
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

  const content = convertSlidesForSteps(
    callout?.formSchema.slides,
    callout?.variants
  );

  return {
    content,
    titleAndImage: {
      title: variants.title,
      description: variants.excerpt,
      coverImageURL: callout?.image || '',
      introText: variants.intro,
      useCustomSlug: !!callout,
      autoSlug: '',
      slug: callout?.slug || '',
      overrideShare: !!callout?.shareTitle,
      shareTitle: variants.shareTitle,
      shareDescription: variants.shareDescription,
    },
    settings: {
      ...settings,
      requireCaptcha: callout?.captcha || 'none',
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
    },
    endMessage: {
      whenFinished: callout?.thanksRedirect ? 'redirect' : 'message',
      thankYouTitle: variants.thanksTitle,
      thankYouText: variants.thanksText,
      thankYouRedirect: variants.thanksRedirect,
    },
    /*mailchimp: {
      useMailchimpSync: false,
    },*/
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
  steps: CalloutStepsProps
): Record<string, CalloutVariantData> {
  const variants: Record<string, CalloutVariantData> = {};
  for (const variant of [...steps.settings.locales, 'default']) {
    const slideNavigation: Record<string, CalloutVariantNavigationData> = {};

    for (const slide of steps.content.slides) {
      slideNavigation[slide.id] = {
        nextText: slide.navigation.nextText[variant] || '',
        prevText: slide.navigation.prevText[variant] || '',
        submitText: slide.navigation.submitText[variant] || '',
      };
    }

    const componentText: Record<string, string> = {};
    for (const key in steps.content.componentText) {
      componentText[key] = steps.content.componentText[key][variant] || '';
    }

    variants[variant] = {
      title: steps.titleAndImage.title[variant] || '',
      excerpt: steps.titleAndImage.description[variant] || '',
      intro: steps.titleAndImage.introText[variant] || '',
      ...(steps.endMessage.whenFinished === 'redirect'
        ? {
            thanksText: '',
            thanksTitle: '',
            thanksRedirect: steps.endMessage.thankYouRedirect[variant] || '',
          }
        : {
            thanksText: steps.endMessage.thankYouText[variant] || '',
            thanksTitle: steps.endMessage.thankYouTitle[variant] || '',
            thanksRedirect: null,
          }),
      ...(steps.titleAndImage.overrideShare
        ? {
            shareTitle: steps.titleAndImage.shareTitle[variant] || '',
            shareDescription:
              steps.titleAndImage.shareDescription[variant] || '',
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
  steps: CalloutStepsProps
): SetCalloutSlideSchema[] {
  return steps.content.slides.map((slide) => ({
    ...slide,
    navigation: {
      nextSlideId: slide.navigation.nextSlideId,
    },
  }));
}

export function convertStepsToCallout(
  steps: CalloutStepsProps
): CreateCalloutData {
  const slug = steps.titleAndImage.useCustomSlug
    ? steps.titleAndImage.slug
    : steps.titleAndImage.autoSlug;

  const slides = convertSlidesForCallout(steps);
  const variants = convertVariantsForCallout(steps);

  return {
    slug: slug || null,
    image: steps.titleAndImage.coverImageURL,
    formSchema: { slides },
    responseViewSchema: steps.settings.showResponses
      ? {
          buckets: steps.settings.responseBuckets,
          titleProp: steps.settings.responseTitleProp,
          imageProp: steps.settings.responseImageProp,
          imageFilter: steps.settings.responseImageFilter,
          gallery: steps.settings.responseViews.includes('gallery'),
          links: steps.settings.responseLinks,
          map: steps.settings.responseViews.includes('map')
            ? {
                ...steps.settings.mapSchema,
                addressPattern: steps.settings.mapSchema.addressPatternProp
                  ? steps.settings.mapSchema.addressPattern
                  : '',
              }
            : null,
        }
      : null,
    starts: steps.dates.startNow
      ? new Date()
      : new Date(steps.dates.startDate + 'T' + steps.dates.startTime),
    expires: steps.dates.hasEndDate
      ? new Date(steps.dates.endDate + 'T' + steps.dates.endTime)
      : null,
    allowMultiple: steps.settings.multipleResponses,
    allowUpdate:
      !steps.settings.multipleResponses && steps.settings.usersCanEditAnswers,
    hidden: !steps.settings.showOnUserDashboards,
    captcha: steps.settings.requireCaptcha,
    access:
      steps.settings.whoCanTakePart === 'members'
        ? 'member'
        : steps.settings.allowAnonymousResponses === 'none'
          ? 'guest'
          : steps.settings.allowAnonymousResponses === 'guests'
            ? 'anonymous'
            : 'only-anonymous',
    variants,
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
