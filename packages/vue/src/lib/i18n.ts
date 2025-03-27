import { config as localeConfig } from '@beabee/locale';
import en from '@beabee/locale/locales/en';

import {
  type DefaultLocaleMessageSchema,
  type LocaleMessages,
  createI18n,
} from 'vue-i18n';

export const localeItems = Object.entries(localeConfig).map(([id, config]) => ({
  id,
  label: config.displayName,
}));

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
