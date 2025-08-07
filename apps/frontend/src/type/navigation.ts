import type { RouteNamedMap } from 'vue-router/auto-routes';

/**
 * Tab item configuration for navigation
 */
export interface TabItem {
  /** Route name - must be a valid route from RouteNamedMap */
  id: keyof RouteNamedMap;
  /** Display label for the tab */
  label: string;
}

/**
 * Resolved tab item with navigation URL
 */
export interface ResolvedTabItem extends TabItem {
  /** Resolved URL for navigation */
  to: string;
}

/**
 * Options for tab navigation resolution
 */
export interface TabNavigationOptions {
  /** Route parameters to pass to all routes */
  params?: Record<string, string | number>;
  /** Query parameters to pass to all routes */
  query?: Record<string, string | string[] | null | undefined>;
}
