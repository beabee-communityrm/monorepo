/**
 * Single source of truth for the icon associated with a page, keyed by route
 * name. Used by the sidebar menu, `addBreadcrumb` calls, and the breadcrumb
 * fallback (for pages with no explicit breadcrumb), so each page's icon only
 * needs to be defined once.
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
 * Look up a page's icon by route name, e.g. for the breadcrumb fallback
 * where the route name is only known at runtime.
 */
export function getRouteIcon(
  name: string | symbol | null | undefined
): string | undefined {
  // Cast needed since `name` isn't statically known to be a key of routeIcons
  return typeof name === 'string'
    ? (routeIcons as Record<string, string>)[name]
    : undefined;
}

/**
 * Single source of truth for the label (an i18n key) associated with a page
 * that also appears in the sidebar menu, keyed by route name. Used so the
 * breadcrumb fallback shows the same text as the sidebar, rather than a
 * separately-worded `pageTitle` (which is meant for the document title and
 * may legitimately say something different, e.g. "Welcome back").
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

/**
 * Look up a page's sidebar label (i18n key, not yet translated) by route
 * name, e.g. for the breadcrumb fallback where the route name is only known
 * at runtime. Returns undefined for routes with no sidebar entry.
 */
export function getRouteLabel(
  name: string | symbol | null | undefined
): string | undefined {
  // Cast needed since `name` isn't statically known to be a key of routeLabels
  return typeof name === 'string'
    ? (routeLabels as Record<string, string>)[name]
    : undefined;
}
