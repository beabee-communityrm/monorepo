import { addNotification } from '@beabee/vue/store/notifications';

import type { Router } from 'vue-router';

import env from '#env';
import { i18n } from '#lib/i18n';
import { currentUser, generalContent, initStore, isEmbed } from '#store/index';
import { client } from '#utils/api';
import { isInternalUrl } from '#utils/index';

export function installRouteGuard(router: Router) {
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

    // The identity provider has the page behind a set or reset password
    // link, so leave before anything renders
    if (
      (to.name === 'set_password' || to.name === 'reset_password') &&
      generalContent.value.oidcEnabled
    ) {
      window.location.href = client.auth.getLoginUrl(
        undefined,
        'setupCredential',
        undefined,
        String(to.params.id)
      );
      return false;
    }

    // Password flow routes don't exist when the identity provider handles login
    if (to.meta.localLoginOnly && generalContent.value.oidcEnabled) {
      return { path: '/auth/login' };
    }

    // The identity provider shows the login page, so leave before anything renders
    if (to.name === 'login' && generalContent.value.oidcEnabled) {
      const next = to.query.next as string | undefined;
      window.location.href = client.auth.getLoginUrl(
        isInternalUrl(next) ? next : '/'
      );
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
}
