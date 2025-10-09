import {
  CalloutAccess,
  CalloutCaptcha,
  type CalloutComponentInputSelectableRadioSchema,
  type CalloutComponentSchema,
  type CalloutNewsletterSchema,
  type CalloutVariantData,
  type CalloutVariantNavigationData,
  type CreateCalloutData,
  type CreateCalloutVariantData,
  type GetCalloutDataWith,
  type GetCalloutSlideSchema,
  ItemStatus,
  type SetCalloutSlideSchema,
  flattenComponents,
} from '@beabee/beabee-common';
import { type LocaleOptions, config as localeConfig } from '@beabee/locale';

import type {
  FormBuilderNavigation,
  FormBuilderSlide,
} from '@components/form-builder/form-builder.interface';
import type { CalloutHorizontalTabsData } from '@components/pages/admin/callouts/CalloutHorizontalTabs.interface';
import type { ContentTabData } from '@components/pages/admin/callouts/tabs/ContentTab/ContentTab.vue';
import type { SettingsTabData } from '@components/pages/admin/callouts/tabs/SettingsTab.vue';
import type { TitleAndImageTabData } from '@components/pages/admin/callouts/tabs/TitleAndImageTab.vue';
import type { TranslationsTabData } from '@components/pages/admin/callouts/tabs/TranslationsTab.vue';
import type { LocaleProp } from '@type';
import { format } from 'date-fns';
import { computed } from 'vue';

import env from '../env';
import { i18n } from '../lib/i18n';
import type { FilterItem, FilterItems } from '../type/search';

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
    captchaEnabled: callout ? callout.captcha !== CalloutCaptcha.None : false,
    captchaForMembers: callout?.captcha === CalloutCaptcha.All,
    channels: callout?.channels || null,
  };

  const defaultNewsletterSettings: CalloutNewsletterSchema = {
    title: '',
    text: '',
    optIn: '',
    groups: [],
  };

  const settings: SettingsTabData = env.cnrMode
    ? ({
        ...sharedSettings,
        openToEveryone: true,
        collectInfo: false,
        collectGuestInfo: false,
        showNewsletterOptIn: false,
        newsletterSettings: defaultNewsletterSettings,
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
        collectInfo: callout?.access !== CalloutAccess.OnlyAnonymous,
        collectGuestInfo: callout?.access === CalloutAccess.Guest,
        showNewsletterOptIn: !!callout?.newsletterSchema,
        newsletterSettings:
          callout?.newsletterSchema || defaultNewsletterSettings,
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
    sidebarTabs: {
      content: undefined,
      intro: {
        introText: variants.intro,
      },
      email: {},
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

  // Build responseLinkText from variants like componentText
  const responseLinkText: Record<string, LocaleProp> = {};

  // Initialize with response link labels as defaults
  for (const link of callout?.responseViewSchema?.links || []) {
    responseLinkText[link.text] = { default: link.text };
  }

  // Load existing translations from variants
  if (callout?.variants) {
    for (const variant in callout.variants) {
      for (const ref in callout.variants[variant].responseLinkText) {
        responseLinkText[ref] ||= { default: ref };
        const text = callout.variants[variant].responseLinkText[ref];
        responseLinkText[ref][variant] = text;
      }
    }
  }

  // Translations tab data
  const translations: TranslationsTabData = {
    locales,
    componentText,
    responseLinkText,
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
 * Converts a callout variant for the API format
 *
 * @param tabs - The callout data from the editor tabs
 * @param variant - The variant to convert (e.g., 'default', 'de', 'en')
 * @returns The variant data for the callout in the format expected by the API
 */
function convertVariantForCallout(
  tabs: CalloutHorizontalTabsData,
  variant: string
): CalloutVariantData {
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

  // Collect response link translations into a dedicated variant field
  const responseLinkText: Record<string, string> = {};
  for (const link of tabs.responseDisplay.responseLinks) {
    const ref = link.text;
    const value = tabs.translations.responseLinkText[ref]?.[variant] ?? '';
    responseLinkText[ref] = value;
  }

  return {
    title: tabs.titleAndImage.title[variant] || '',
    excerpt: tabs.titleAndImage.description[variant] || '',
    intro: tabs.content.sidebarTabs.intro.introText[variant] || '',
    ...(tabs.content.sidebarTabs.endMessage.whenFinished === 'redirect'
      ? {
          thanksText: '',
          thanksTitle: '',
          thanksRedirect:
            tabs.content.sidebarTabs.endMessage.thankYouRedirect[variant] || '',
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
          shareDescription: tabs.titleAndImage.shareDescription[variant] || '',
        }
      : {
          shareTitle: null,
          shareDescription: null,
        }),
    slideNavigation,
    componentText,
    responseLinkText,
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
): CreateCalloutVariantData {
  return {
    default: convertVariantForCallout(tabs, 'default'),
    ...Object.fromEntries(
      tabs.translations.locales.map((locale) => [
        locale,
        convertVariantForCallout(tabs, locale),
      ])
    ),
  };
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

  const access = tabs.settings.openToEveryone
    ? tabs.settings.collectInfo
      ? tabs.settings.collectGuestInfo
        ? CalloutAccess.Guest
        : CalloutAccess.Anonymous
      : CalloutAccess.OnlyAnonymous
    : CalloutAccess.Member;

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
    access,
    variants,
    channels: tabs.settings.channels,
    newsletterSchema:
      access !== CalloutAccess.OnlyAnonymous &&
      tabs.settings.showNewsletterOptIn
        ? tabs.settings.newsletterSettings
        : null,
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

/**
 * Core fallback logic for locale resolution following localeConfig fallback chains
 *
 * @param prop - The LocaleProp object containing translations
 * @param locale - The requested locale
 * @param defaultLocale - The default locale
 * @param options - Configuration options for fallback behavior
 * @returns The localized value with fallbacks applied
 */
export function getLocalizedValue(
  prop: LocaleProp | undefined,
  locale: string,
  defaultLocale: string,
  options: {
    useFallback: boolean;
    fallbackToDefault?: boolean;
    placeholderValue?: string;
  } = { useFallback: true, fallbackToDefault: true }
): string {
  if (!prop) return options.placeholderValue || '';

  const { useFallback, fallbackToDefault } = options;

  // If requesting default locale, return default value
  if (locale === defaultLocale) {
    return prop.default || '';
  }

  // Try the requested locale first
  if (prop[locale]) {
    return prop[locale];
  }

  // If fallback is disabled, return empty or placeholder
  if (!useFallback) {
    return options.placeholderValue || '';
  }

  // Try fallback chain from localeConfig
  let currentLocale: keyof LocaleOptions = locale as keyof LocaleOptions;
  const config = localeConfig as LocaleOptions;

  // Follow the fallback chain as defined in localeConfig
  while (currentLocale && config[currentLocale]?.fallbackLocale) {
    currentLocale = config[currentLocale].fallbackLocale!;

    // Try the fallback locale
    if (prop[currentLocale]) {
      return prop[currentLocale] || '';
    }
  }

  // If no fallback found and we should fallback to default
  if (fallbackToDefault) {
    return prop.default || '';
  }

  return options.placeholderValue || '';
}

/**
 * Update a localized value in a LocaleProp object
 *
 * @param prop - The LocaleProp object to update
 * @param locale - The locale to update
 * @param value - The new value
 * @param defaultLocale - The default locale
 */
export function updateLocalizedValue(
  prop: LocaleProp,
  locale: string,
  value: string,
  defaultLocale: string
): void {
  if (locale === defaultLocale) {
    prop.default = value;
  } else {
    prop[locale] = value;
  }
}

/**
 * Update a component text value by reference
 *
 * @param componentText - The component text object to update
 * @param ref - The reference key for the text
 * @param locale - The locale to update
 * @param value - The new value
 * @param defaultLocale - The default locale
 */
export function updateComponentText(
  componentText: Record<string, LocaleProp>,
  ref: string | undefined,
  locale: string,
  value: string,
  defaultLocale: string
): void {
  if (!ref) return;

  // Initialize the LocaleProp if it doesn't exist
  if (!componentText[ref]) {
    componentText[ref] = { default: ref };
  }

  updateLocalizedValue(componentText[ref], locale, value, defaultLocale);
}

/**
 * Get component text value with optional fallback support
 *
 * @param componentText - The component text object containing all translations
 * @param ref - The reference key for the text
 * @param locale - The locale to get the value for
 * @param defaultLocale - The default locale
 * @param useFallback - Whether to use fallback logic (default: true)
 * @returns The translation for the locale or fallback value
 */
export function getComponentText(
  componentText: Record<string, LocaleProp>,
  ref: string | undefined,
  locale: string,
  defaultLocale: string,
  useFallback: boolean = true
): string {
  if (!ref) return '';

  const prop = componentText[ref];
  if (!prop) return useFallback ? ref : '';

  return getLocalizedValue(prop, locale, defaultLocale, {
    useFallback,
    fallbackToDefault: useFallback,
    placeholderValue: useFallback ? ref : '',
  });
}

/**
 * Generate component text with optional fallback support from callout variant data
 *
 * @param variants - The callout variant data
 * @param currentLocale - The current locale (e.g., 'de@easy', 'de', 'en')
 * @param defaultLocale - The default locale (usually 'en')
 * @param useFallback - Whether to use fallback logic (default: true)
 * @returns Component text with optional fallback translations applied
 */
export function generateComponentText(
  variants: Record<string, CalloutVariantData> | undefined,
  currentLocale: string,
  defaultLocale: string,
  useFallback: boolean = true
): Record<string, string> {
  if (!variants) return {};

  // Build LocaleProp structure for component text
  const componentTextProps: Record<string, LocaleProp> = {};
  const allKeys = new Set<string>();

  // Collect all keys from all variants
  for (const variant in variants) {
    for (const key in variants[variant].componentText) {
      allKeys.add(key);
    }
  }

  // Build LocaleProp structure for each key
  for (const key of allKeys) {
    componentTextProps[key] = { default: '' };

    // Add all locale variants including default
    for (const variant in variants) {
      const text = variants[variant].componentText[key];
      if (text) {
        componentTextProps[key][variant] = text;
      }
    }
  }

  // Apply fallback logic for each key
  const result: Record<string, string> = {};
  for (const key in componentTextProps) {
    const translatedValue = getLocalizedValue(
      componentTextProps[key],
      currentLocale,
      defaultLocale,
      { useFallback }
    );
    if (translatedValue) {
      result[key] = translatedValue;
    }
  }

  return result;
}

/**
 * Generate slide navigation with optional fallback support from callout variant data
 *
 * @param slides - The slides from the callout
 * @param variants - The callout variant data
 * @param currentLocale - The current locale (e.g., 'de@easy', 'de', 'en')
 * @param defaultLocale - The default locale (usually 'en')
 * @param useFallback - Whether to use fallback logic (default: true)
 * @returns Slides with optional navigation text fallbacks applied
 */
export function generateSlides(
  slides: GetCalloutSlideSchema[],
  variants: Record<string, CalloutVariantData> | undefined,
  currentLocale: string,
  defaultLocale: string,
  useFallback: boolean = true
): GetCalloutSlideSchema[] {
  if (!variants || !slides.length) return slides;

  return slides.map((slide) => {
    // Create LocaleProp objects for each navigation field using the utility function
    const navigationFields = ['nextText', 'prevText', 'submitText'] as const;
    const navigationProps: Record<string, LocaleProp> = {};

    // Build LocaleProp structure for each navigation field
    for (const field of navigationFields) {
      navigationProps[field] = { default: '' };

      // Add all locale variants including default
      for (const variant in variants) {
        const text = variants[variant].slideNavigation[slide.id]?.[field];
        if (text) {
          navigationProps[field][variant] = text;
        }
      }
    }

    // Apply fallback logic and create navigation object
    const navigation = {
      ...slide.navigation,
      nextText:
        getLocalizedValue(
          navigationProps.nextText,
          currentLocale,
          defaultLocale,
          { useFallback }
        ) || slide.navigation.nextText,
      prevText:
        getLocalizedValue(
          navigationProps.prevText,
          currentLocale,
          defaultLocale,
          { useFallback }
        ) || slide.navigation.prevText,
      submitText:
        getLocalizedValue(
          navigationProps.submitText,
          currentLocale,
          defaultLocale,
          { useFallback }
        ) || slide.navigation.submitText,
    };

    return {
      ...slide,
      navigation,
    };
  });
}

/**
 * Generate response links with optional fallback support from callout variant data
 *
 * @param links - The response links from the callout
 * @param variants - The callout variant data
 * @param currentLocale - The current locale (e.g., 'de@easy', 'de', 'en')
 * @param defaultLocale - The default locale (usually 'en')
 * @param useFallback - Whether to use fallback logic (default: true)
 * @returns Response links with optional label fallbacks applied
 */
export function generateResponseLinks(
  links: { text: string; url: string }[],
  variants: Record<string, CalloutVariantData> | undefined,
  currentLocale: string,
  defaultLocale: string,
  useFallback: boolean = true
): { text: string; url: string }[] {
  if (!variants || !links.length) return links;

  // Build LocaleProp structure for response link texts
  const responseLinkProps: Record<string, LocaleProp> = {};
  const allKeys = new Set<string>();

  // Collect all keys from all variants
  for (const variant in variants) {
    for (const key in variants[variant].responseLinkText) {
      allKeys.add(key);
    }
  }

  // Build LocaleProp structure for each key
  for (const key of allKeys) {
    responseLinkProps[key] = { default: key };

    // Add all locale variants including default
    for (const variant in variants) {
      const text = variants[variant].responseLinkText[key];
      if (text) {
        responseLinkProps[key][variant] = text;
      }
    }
  }

  return links.map((link) => {
    // Get the LocaleProp for this link's text
    const textProp = responseLinkProps[link.text] || { default: link.text };

    // Apply fallback logic
    const translatedText =
      getLocalizedValue(textProp, currentLocale, defaultLocale, {
        useFallback,
      }) || link.text;

    return {
      ...link,
      text: translatedText,
    };
  });
}
