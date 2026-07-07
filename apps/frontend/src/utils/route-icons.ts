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
