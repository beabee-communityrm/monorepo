import {
  type BaseLocale,
  type Locale,
  LocaleContext,
  isLocale,
  config as localeConfig,
} from '@beabee/locale';
import { getLocaleItemsForContext, i18n } from '@beabee/vue/lib/i18n';

import { computed, watch } from 'vue';

import router from '#lib/router';

import { generalContent } from '../store';

export const contentLocale = computed<Locale>(() => {
  const newLocale =
    router.currentRoute.value.query.lang?.toString() ||
    generalContent.value.locale;
  return isLocale(newLocale) ? newLocale : 'en';
});

export const currentLocale = computed<Locale>(() =>
  // Some locales have only been translated in non-admin areas
  router.currentRoute.value.path.startsWith('/admin')
    ? localeConfig[contentLocale.value].adminLocale
    : contentLocale.value
);

export const currentLocaleConfig = computed(
  () => localeConfig[currentLocale.value]
);

// Update document title on route or locale change
watch([currentLocale, router.currentRoute], ([, route]) => {
  document.title =
    (route.meta.pageTitle ? i18n.global.t(route.meta.pageTitle) + ' - ' : '') +
    generalContent.value.organisationName;
});

// Update i18n library locale when the current locale changes
watch(
  [currentLocale, () => generalContent.value.currencyCode],
  async ([newLocale, newCurrencyCode]) => {
    // Remove variants (e.g. @informal)
    const justLocale: BaseLocale = newLocale
      .toString()
      .split('@')[0] as BaseLocale;

    // en is already loaded
    if (newLocale !== 'en') {
      // For the dynamic import to work the locale must be a path, we can't
      // reference @beabee/locale here
      const messages = await import(
        `../../../../packages/locale/dist/locales-with-fallback/${newLocale}.json`
      );
      i18n.global.setLocaleMessage(justLocale, messages.default);
    }

    i18n.global.setNumberFormat(justLocale, {
      currency: {
        style: 'currency',
        currency: newCurrencyCode,
      },
    });

    i18n.global.locale.value = justLocale;
    document.documentElement.setAttribute('lang', justLocale);
  }
);

export const localeItems = getLocaleItemsForContext(LocaleContext.System);

export { i18n };
