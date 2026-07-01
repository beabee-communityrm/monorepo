import type { NavigationMenuItem } from '@nuxt/ui';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import env from '#env';
import { canAdmin, currentUser } from '#store/currentUser';
import { generalContent } from '#store/generalContent';

type MenuItem = NavigationMenuItem & { visible: boolean };

function filterVisible(groups: MenuItem[][]): NavigationMenuItem[][] {
  return groups
    .map((group) =>
      group
        .filter((item) => item.visible)
        .map((item): NavigationMenuItem => item)
    )
    .filter((group) => group.length > 0);
}

export function useMenu() {
  const { t } = useI18n();

  const items = computed<NavigationMenuItem[][]>(() => [
    ...filterVisible([
      [
        {
          label: t('menu.home'),
          icon: 'i-lucide-house',
          to: '/profile',
          visible: !env.cnrMode,
          exact: true,
        },
        {
          label: t('menu.callouts'),
          icon: 'i-lucide-megaphone',
          to: '/crowdnewsroom',
          visible: !env.cnrMode,
        },
        {
          label: t('menu.account'),
          icon: 'i-lucide-contact',
          to: '/profile/account',
          visible: !!currentUser.value,
        },
        {
          label: t('menu.contribution'),
          icon: 'i-lucide-credit-card',
          to: '/profile/contribution',
          visible:
            !!currentUser.value &&
            !generalContent.value.hideContribution &&
            !env.cnrMode,
        },
      ],
    ]),
    ...filterVisible([
      [
        {
          label: t('menu.admin'),
          type: 'label' as const,
          visible: canAdmin.value || !!currentUser.value?.isReviewer,
        },
        {
          label: t('menu.dashboard'),
          icon: 'i-lucide-chart-line',
          to: '/admin',
          visible: canAdmin.value,
          exact: true,
        },
        {
          label: t('menu.contacts'),
          icon: 'i-lucide-users',
          to: '/admin/contacts',
          visible: canAdmin.value,
        },
        {
          label: t('menu.callouts'),
          icon: 'i-lucide-megaphone',
          to: '/admin/crowdnewsroom',
          visible: canAdmin.value || !!currentUser.value?.isReviewer,
        },
        {
          label: t('menu.notices'),
          icon: 'i-lucide-bell',
          to: '/admin/notices',
          visible: canAdmin.value && !env.cnrMode,
        },
        {
          label: t('menu.membershipBuilder'),
          icon: 'i-lucide-handshake',
          to: '/admin/membership-builder',
          visible: canAdmin.value && !env.cnrMode,
        },
        {
          label: t('menu.adminSettings'),
          icon: 'i-lucide-settings',
          to: '/admin/settings',
          visible: canAdmin.value,
        },
      ],
    ]),
  ]);

  return { items };
}
