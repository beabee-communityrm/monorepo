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

export const menu = computed<MenuSection[]>(() =>
  env.cnrMode
    ? [
        {
          items: [
            {
              title: 'menu.account',
              href: '/profile/account',
              icon: faAddressCard,
            },
          ],
        },
      ]
    : [
        {
          items: [
            {
              title: 'menu.home',
              href: '/profile',
              icon: faHouse,
            },
            {
              title: 'menu.callouts',
              href: '/callouts',
              icon: faBullhorn,
              isActive: /^\/callouts/,
            },
          ],
        },
        {
          items: [
            {
              title: 'menu.account',
              href: '/profile/account',
              icon: faAddressCard,
            },
            ...(generalContent.value.hideContribution
              ? []
              : [
                  {
                    title: 'menu.contribution',
                    href: '/profile/contribution',
                    icon: faCreditCard,
                  },
                ]),
          ],
        },
      ]
);

export const adminMenu: MenuSection[] = env.cnrMode
  ? [
      {
        title: 'menu.admin',
        items: [
          {
            title: 'menu.dashboard',
            href: '/admin',
            icon: faChartLine,
          },
          {
            title: 'menu.contacts',
            href: '/admin/contacts',
            icon: faUsers,
            isActive: /^\/admin\/contacts.*/,
          },
          {
            title: 'menu.callouts',
            href: '/admin/callouts',
            icon: faBullhorn,
            isActive: /^\/admin\/callouts.*/,
          },
        ],
      },
      {
        items: [
          {
            title: 'menu.adminSettings',
            href: '/admin/settings',
            icon: faCog,
            isActive: /^\/admin\/settings.*/,
          },
        ],
      },
    ]
  : [
      {
        title: 'menu.admin',
        items: [
          {
            title: 'menu.dashboard',
            href: '/admin',
            icon: faChartLine,
          },
          {
            title: 'menu.contacts',
            href: '/admin/contacts',
            icon: faUsers,
            isActive: /^\/admin\/contacts.*/,
          },
          {
            title: 'menu.callouts',
            href: '/admin/callouts',
            icon: faBullhorn,
            isActive: /^\/admin\/callouts.*/,
          },
          {
            title: 'menu.notices',
            href: '/admin/notices',
            icon: faSignHanging,
            isActive: /^\/admin\/notices.*/,
          },
        ],
      },
      {
        items: [
          {
            title: 'menu.membershipBuilder',
            href: '/admin/membership-builder',
            icon: faHandsHelping,
          },
          {
            title: 'menu.adminSettings',
            href: '/admin/settings',
            icon: faCog,
            isActive: /^\/admin\/settings.*/,
          },
        ],
      },
    ];
