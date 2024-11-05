import { computed, watch } from 'vue';
import {
  type DefaultLocaleMessageSchema,
  type LocaleMessages,
  createI18n,
} from 'vue-i18n';
import { generalContent } from '../store';
import router from '@lib/router';

import i18nConfig from './i18n-config.json';

import en from '../../locales/en.json';

type Diff<T, U> = T extends U ? never : T;

// It seems slightly odd that we have to define these types, why can't the JSON
// import be const typed?
type LocaleKey = keyof typeof i18nConfig;
// Remove any variant languages (can't be base languages)
type BaseLocaleKey = Diff<LocaleKey, `${string}@${string}`>;
interface LocaleConfig {
  baseLocale: BaseLocaleKey;
  name: string;
  displayName: string;
  adminLocale: LocaleKey;
}

export function isLocaleKey(key: string): key is LocaleKey {
  return key in i18nConfig;
}

export const localeItems = Object.entries(i18nConfig).map(([id, config]) => ({
  id,
  label: config.name,
}));

const i18n = createI18n({
  legacy: false,
  fallbackLocale: 'en',
  messages: { en } as LocaleMessages<DefaultLocaleMessageSchema>,
  pluralRules: {
    // Format: 0 | ends in 1 (except 11) | ends in 2,3,4 (except teens) | the rest
    ru: (n) => {
      if (n === 0) {
        return 0;
      }

      // Assume no number given is singular
      if (n === -1) {
        return 1;
      }

      const endsWith = n % 10;
      return (n > 10 && n < 20) || endsWith >= 5 ? 3 : endsWith === 1 ? 1 : 2;
    },
  },
});

export const currentLocale = computed<LocaleKey>(() => {
  const route = router.currentRoute.value;
  const newLocale = route.query.lang?.toString() || generalContent.value.locale;

  const realLocale = isLocaleKey(newLocale) ? newLocale : 'en';

  // Some locales have only been translated in non-admin areas
  return route.path.startsWith('/admin')
    ? (i18nConfig[realLocale].adminLocale as LocaleKey)
    : realLocale;
});

export const currentLocaleConfig = computed<LocaleConfig>(
  () => i18nConfig[currentLocale.value] as LocaleConfig
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
    const [justLocale] = newLocale.split('@');

    // en is already loaded
    if (newLocale !== 'en') {
      const messages = await import(`../../locales/${newLocale}.json`);
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

export default i18n;
