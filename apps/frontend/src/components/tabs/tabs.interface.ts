/**
 * Represents a single tab item in the tab navigation
 *
 * @example
 * // Router-based navigation tab
 * const routerTab: TabItem = {
 *   id: 'users',
 *   label: 'Users',
 *   to: '/users'
 * };
 *
 * // Click-event based tab
 * const clickTab: TabItem = {
 *   id: 'settings',
 *   label: 'Settings',
 *   count: '2'  // Optional count/status indicator
 * };
 */
export interface TabItem {
  /**
   * Unique identifier for the tab
   */
  id: string;
  /**
   * Display text for the tab
   */
  label: string;
  /**
   * Optional count or status indicator to display next to the label
   */
  count?: number;
  /**
   * Optional route path. If provided, the tab will use router-link navigation.
   */
  to?: string;
}
