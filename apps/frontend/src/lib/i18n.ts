import {
  type BaseLocale,
  type Locale,
  LocaleContext,
  isLocale,
  config as localeConfig,
} from '@beabee/locale';
import { getLocaleItemsForContext, i18n } from '@beabee/vue/lib/i18n';
import { addNotification } from '@beabee/vue/store/notifications';

import { computed, watch } from 'vue';

import env from '#env';
import router from '#lib/router';

import { currentUser, generalContent, initStore, isEmbed } from '../store';

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

router.beforeEach(async (to) => {
  // Block route for initial store load, this will only happen once
  await initStore();

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

export const localeItems = getLocaleItemsForContext(LocaleContext.System);

export { i18n };
