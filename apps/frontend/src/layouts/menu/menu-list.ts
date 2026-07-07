import type { NavigationMenuItem } from '@nuxt/ui';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import env from '#env';
import { canAdmin, currentUser } from '#store/currentUser';
import { generalContent } from '#store/generalContent';
import { routeIcons } from '#utils/route-icons';

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
          icon: routeIcons.profile,
          to: '/profile',
          visible: !env.cnrMode,
          exact: true,
        },
        {
          label: t('menu.callouts'),
          icon: routeIcons.callouts,
          to: '/crowdnewsroom',
          visible: !env.cnrMode,
        },
        {
          label: t('menu.account'),
          icon: routeIcons.profileAccount,
          to: '/profile/account',
          visible: !!currentUser.value,
        },
        {
          label: t('menu.contribution'),
          icon: routeIcons.profileContribution,
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
          icon: routeIcons.admin,
          to: '/admin',
          visible: canAdmin.value,
          exact: true,
        },
        {
          label: t('menu.contacts'),
          icon: routeIcons.adminContacts,
          to: '/admin/contacts',
          visible: canAdmin.value,
        },
        {
          label: t('menu.callouts'),
          icon: routeIcons.adminCallouts,
          to: '/admin/crowdnewsroom',
          visible: canAdmin.value || !!currentUser.value?.isReviewer,
        },
        {
          label: t('menu.notices'),
          icon: routeIcons.adminNotices,
          to: '/admin/notices',
          visible: canAdmin.value && !env.cnrMode,
        },
        {
          label: t('menu.membershipBuilder'),
          icon: routeIcons.adminMembershipBuilder,
          to: '/admin/membership-builder',
          visible: canAdmin.value && !env.cnrMode,
        },
        {
          label: t('menu.adminSettings'),
          icon: routeIcons.adminSettings,
          to: '/admin/settings',
          visible: canAdmin.value,
        },
      ],
    ]),
  ]);

  return { items };
}
