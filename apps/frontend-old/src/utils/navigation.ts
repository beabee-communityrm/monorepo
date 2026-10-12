import type { Router } from 'vue-router';

import type {
  NavigationOptions,
  NavigationResolvedTabItem,
  NavigationTabItem,
} from '#type/navigation';

/**
 * Resolves tab navigation items with type-safe route resolution
 *
 * @param router - Vue Router instance
 * @param items - Array of tab items with route names and labels
 * @param options - Optional parameters and query options for routes
 * @returns Array of resolved tab items with navigation URLs
 *
 * @example
 * ```ts
 * // Simple usage without parameters
 * const tabs = computed(() => resolveTabNavigation(router, [
 *   { id: 'adminSettingsGeneral', label: t('settings.general') },
 *   { id: 'adminSettingsEmail', label: t('settings.email') }
 * ]));
 *
 * // Usage with route parameters
 * const tabs = computed(() => resolveTabNavigation(router, [
 *   { id: 'adminContactsViewOverview', label: t('contact.overview') },
 *   { id: 'adminContactsViewAccount', label: t('contact.account') }
 * ], {
 *   params: { id: contact.value?.id || '-' }
 * }));
 * ```
 */
export function resolveTabNavigation(
  router: Router,
  items: NavigationTabItem[],
  options: NavigationOptions = {}
): NavigationResolvedTabItem[] {
  return items.map((item) => ({
    ...item,
    to: router.resolve({
      name: item.id,
      params: options.params,
      query: options.query,
    }).href,
  }));
}
