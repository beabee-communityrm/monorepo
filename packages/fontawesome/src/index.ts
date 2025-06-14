/**
 * FontAwesome Package
 *
 * A comprehensive FontAwesome icon management package with search,
 * filtering, and utility functions optimized for icon pickers.
 */

// Export all types
export * from './types';

// Export data
export { FONTAWESOME_ICONS } from './data/icons';
export { FONTAWESOME_CATEGORIES } from './data/categories';

// Export services (primary API for icon picker functionality)
export { IconSearchService } from './services';
export type { IIconSearchService } from './services';

// Export utilities (general helper functions)
export * from './utils';

// Create and export a default service instance for convenience
export { IconSearchService as DefaultIconSearchService } from './services';

/**
 * Create a new IconSearchService instance with custom configuration
 *
 * @example
 * ```typescript
 * import { createIconSearchService } from '@beabee/fontawesome';
 *
 * const searchService = createIconSearchService({
 *   enableFuzzy: true,
 *   maxResults: 50
 * });
 *
 * const results = searchService.searchIcons('heart');
 * ```
 */
export function createIconSearchService(
  config?: import('./types').SearchConfig
) {
  const { IconSearchService } = require('./services');
  return new IconSearchService(config);
}
