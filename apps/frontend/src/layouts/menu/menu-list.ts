import { computed } from 'vue';
import type { MenuSection } from './menu-list.interface';
import { generalContent } from '@store/generalContent';
import {
  faAddressCard,
  faBullhorn,
  faChartLine,
  faCog,
  faCreditCard,
  faHandsHelping,
  faHouse,
  faSignHanging,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import env from '@env';
import { canAdmin, currentUser } from '@store/currentUser';

export const menu = computed<MenuSection[]>(() => [
  {
    items: [
      {
        title: 'menu.home',
        href: '/profile',
        icon: faHouse,
        visible: !env.cnrMode,
      },
      {
        title: 'menu.callouts',
        href: '/callouts',
        icon: faBullhorn,
        isActive: /^\/callouts/,
        visible: !env.cnrMode,
      },
    ],
  },
  {
    items: [
      {
        title: 'menu.account',
        href: '/profile/account',
        icon: faAddressCard,
        visible: !!currentUser.value,
      },
      {
        title: 'menu.contribution',
        href: '/profile/contribution',
        icon: faCreditCard,
        visible:
          !!currentUser.value &&
          !generalContent.value.hideContribution &&
          !env.cnrMode,
      },
    ],
  },
]);

export const adminMenu = computed<MenuSection[]>(() => [
  {
    title: 'menu.admin',
    items: [
      {
        title: 'menu.dashboard',
        href: '/admin',
        icon: faChartLine,
        visible: canAdmin.value,
      },
      {
        title: 'menu.contacts',
        href: '/admin/contacts',
        icon: faUsers,
        isActive: /^\/admin\/contacts.*/,
        visible: canAdmin.value,
      },
      {
        title: 'menu.callouts',
        href: '/admin/callouts',
        icon: faBullhorn,
        isActive: /^\/admin\/callouts.*/,
        visible: canAdmin.value || !!currentUser.value?.isReviewer,
      },
      {
        title: 'menu.notices',
        href: '/admin/notices',
        icon: faSignHanging,
        isActive: /^\/admin\/notices.*/,
        visible: canAdmin.value && !env.cnrMode,
      },
    ],
  },
  {
    items: [
      {
        title: 'menu.membershipBuilder',
        href: '/admin/membership-builder',
        icon: faHandsHelping,
        visible: canAdmin.value && !env.cnrMode,
      },
      {
        title: 'menu.adminSettings',
        href: '/admin/settings',
        icon: faCog,
        isActive: /^\/admin\/settings.*/,
        visible: canAdmin.value,
      },
    ],
  },
]);
