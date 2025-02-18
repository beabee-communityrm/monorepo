import { isLocale, type Locale, config as localeConfig } from '@beabee/locale';
import { en } from '@beabee/locale/locales/en';

import { computed, watch } from 'vue';
import {
  type DefaultLocaleMessageSchema,
  type LocaleMessages,
  createI18n,
} from 'vue-i18n';
import { currentUser, generalContent, initStore, isEmbed } from '../store';
import router from '@lib/router';

import env from '@env';
import { addNotification } from '@store/notifications';

export const localeItems = Object.entries(localeConfig).map(([id, config]) => ({
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

export const currentLocale = computed<Locale>(() => {
  const route = router.currentRoute.value;
  const newLocale = route.query.lang?.toString() || generalContent.value.locale;

  const realLocale = isLocale(newLocale) ? newLocale : 'en';

  // Some locales have only been translated in non-admin areas
  return route.path.startsWith('/admin')
    ? localeConfig[realLocale].adminLocale
    : realLocale;
});

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
    const justLocale = newLocale.toString().split('@')[0];

    // en is already loaded
    if (newLocale !== 'en') {
      // For the dynamic import to work the locale must be a path, we can't
      // reference @beabee/locale here
      const messages = await import(
        `../../../../packages/locale/dist/locales/${String(newLocale)}.js`
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

router.beforeEach(async (to) => {
  // Block route for initial store load, this will only happen once
  await initStore;

  // Ensure route is embeddable if we are embedded
  if (isEmbed && !to.meta.embeddable) {
    return false;
  }

  // Don't load routes that are not available in CNR mode
  if (env.cnrMode && to.meta.noCnrMode) {
    return false;
  }

  const user = currentUser.value;
  // Route requires authentication
  if (user == null && !to.meta.noAuth) {
    return { path: '/auth/login', query: { next: to.path } };
  }
  // Route requires a specific role
  if (to.meta.role && !user?.activeRoles.includes(to.meta.role)) {
    addNotification({
      variant: 'error',
      title: i18n.global.t('form.errorMessages.unauthorized'),
    });
    return false;
  }
});

export default i18n;
