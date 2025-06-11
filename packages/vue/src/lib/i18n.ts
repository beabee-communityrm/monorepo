import {
  type Locale,
  LocaleContext,
  isAvailableInContext,
  config as localeConfig,
} from '@beabee/locale';
import en from '@beabee/locale/locales/en';

import {
  type DefaultLocaleMessageSchema,
  type LocaleMessages,
  createI18n,
} from 'vue-i18n';

const localeItems = Object.entries(localeConfig).map(([id, config]) => ({
  id,
  label: config.name,
})) as { id: Locale; label: string }[];

export const getLocaleItemsForContext = (context: LocaleContext) => {
  return localeItems
    .filter((item) => isAvailableInContext(item.id, context))
    .map((item) => ({
      id: item.id,
      label: item.label,
    }));
};

export const i18n = createI18n({
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
