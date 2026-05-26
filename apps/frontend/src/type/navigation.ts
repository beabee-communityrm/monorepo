import type { RouteNamedMap } from 'vue-router/auto-routes';

/**
 * Tab item configuration for navigation
 */
export interface NavigationTabItem {
  /** Route name - must be a valid route from RouteNamedMap */
  id: keyof RouteNamedMap;
  /** Display label for the tab */
  label: string;
}

/**
 * Resolved tab item with navigation URL
 */
export interface NavigationResolvedTabItem extends NavigationTabItem {
  /** Resolved URL for navigation */
  to: string;
}

/**
 * Options for tab navigation resolution
 */
export interface NavigationOptions {
  /** Route parameters to pass to all routes */
  params?: Record<string, string | number>;
  /** Query parameters to pass to all routes */
  query?: Record<string, string | string[] | null | undefined>;
}
