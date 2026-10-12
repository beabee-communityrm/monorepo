/**
 * Single source of truth for the icon associated with a page, keyed by route
 * name. Used by the sidebar menu and `addBreadcrumb` calls, so each page's
 * icon only needs to be defined once.
 */
export const routeIcons = {
  profile: 'i-lucide-house',
  callouts: 'i-lucide-megaphone',
  profileAccount: 'i-lucide-contact',
  profileContribution: 'i-lucide-credit-card',
  admin: 'i-lucide-chart-line',
  adminContacts: 'i-lucide-users',
  adminCallouts: 'i-lucide-megaphone',
  adminNotices: 'i-lucide-bell',
  adminMembershipBuilder: 'i-lucide-handshake',
  adminSettings: 'i-lucide-settings',
} as const;

/**
 * Single source of truth for the label (an i18n key) associated with a page
 * that also appears in the sidebar menu, keyed by route name. Used by
 * `addBreadcrumb` calls so the breadcrumb text always matches the sidebar,
 * rather than duplicating the same i18n key as a literal string.
 */
export const routeLabels = {
  profile: 'menu.home',
  callouts: 'menu.callouts',
  profileAccount: 'menu.account',
  profileContribution: 'menu.contribution',
  admin: 'menu.dashboard',
  adminContacts: 'menu.contacts',
  adminCallouts: 'menu.callouts',
  adminNotices: 'menu.notices',
  adminMembershipBuilder: 'menu.membershipBuilder',
  adminSettings: 'menu.adminSettings',
} as const;
