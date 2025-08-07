import type { ResolvedTabItem, TabItem } from '@type/navigation';
import type { Router } from 'vue-router';

/**
 * Resolves tab navigation items with type-safe route resolution
 *
 * @param router - Vue Router instance
 * @param items - Array of tab items with route names and labels
 * @returns Array of resolved tab items with navigation URLs
 *
 * @example
 * ```ts
 * const tabs = computed(() => resolveTabNavigation(router, [
 *   { id: 'adminSettingsGeneral', label: t('settings.general') },
 *   { id: 'adminSettingsEmail', label: t('settings.email') }
 * ]));
 * ```
 */
export function resolveTabNavigation(
  router: Router,
  items: TabItem[]
): ResolvedTabItem[] {
  return items.map((item) => ({
    ...item,
    to: router.resolve({ name: item.id }).href,
  }));
}
