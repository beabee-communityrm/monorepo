import type { IconData } from '../types/icon-data.ts';
import type { SearchOptions, SearchResult } from '../types/search.ts';
import { filterByCategories } from './category-utils.ts';
import { camelToKebab, normalizeSearchTerm } from './string.ts';

/**
 * Check if an icon matches the search query
 * @param icon - The icon to check
 * @param query - The search query
 * @param caseSensitive - Whether the search should be case sensitive
 * @returns True if the icon matches the query, false otherwise
 */
function iconMatchesQuery(
  icon: IconData,
  query: string,
  caseSensitive = false
): boolean {
  if (!query) return true;

  const normalizedQuery = normalizeSearchTerm(query, caseSensitive);
  const normalizedName = normalizeSearchTerm(icon.name, caseSensitive);
  const normalizedKebabName = normalizeSearchTerm(
    icon.kebabName,
    caseSensitive
  );

  // Check icon name (both camelCase and kebab-case)
  if (
    normalizedName.includes(normalizedQuery) ||
    normalizedKebabName.includes(normalizedQuery)
  ) {
    return true;
  }

  // Check tags
  const tagsMatch = icon.metadata.tags.some((tag) =>
    normalizeSearchTerm(tag, caseSensitive).includes(normalizedQuery)
  );

  if (tagsMatch) return true;

  // Check aliases if they exist
  if (icon.metadata.aliases) {
    const aliasMatch = icon.metadata.aliases.some((alias) => {
      const aliasName = typeof alias === 'string' ? alias : alias.name;
      const normalizedAliasName = normalizeSearchTerm(aliasName, caseSensitive);
      const normalizedAliasKebab = normalizeSearchTerm(
        camelToKebab(aliasName),
        caseSensitive
      );

      return (
        normalizedAliasName.includes(normalizedQuery) ||
        normalizedAliasKebab.includes(normalizedQuery)
      );
    });

    if (aliasMatch) return true;
  }

  return false;
}

/**
 * Filter out deprecated icons if specified
 * @param icons - Array of icons to filter
 * @param includeDeprecated - Whether to include deprecated icons
 * @returns Filtered array of icons
 */
function filterDeprecated(
  icons: IconData[],
  includeDeprecated = true
): IconData[] {
  if (includeDeprecated) return icons;

  return icons.filter((icon) => !icon.metadata.deprecated);
}

/**
 * Search icons based on the given options
 * @param iconData - Array of icon data to search through
 * @param options - Search configuration options
 * @returns Search results with filtered icons and metadata
 */
export function searchIcons(
  iconData: IconData[],
  options: SearchOptions = {}
): SearchResult {
  const {
    query,
    categories,
    includeDeprecated = true,
    caseSensitive = false,
  } = options;

  let filteredIcons = iconData;

  // Filter by categories first
  filteredIcons = filterByCategories(filteredIcons, categories || []);

  // Filter by search query
  if (query) {
    filteredIcons = filteredIcons.filter((icon) =>
      iconMatchesQuery(icon, query, caseSensitive)
    );
  }

  // Filter deprecated icons
  filteredIcons = filterDeprecated(filteredIcons, includeDeprecated);

  // Get unique categories from filtered results
  const resultCategories = Array.from(
    new Set(filteredIcons.flatMap((icon) => icon.metadata.categories))
  ).sort();

  return {
    icons: filteredIcons,
    totalCount: filteredIcons.length,
    categories: resultCategories,
  };
}

/**
 * Get suggested search terms based on icon tags
 * @param iconData - Array of icon data to analyze
 * @param limit - Maximum number of suggestions to return
 * @returns Array of suggested search terms sorted by frequency
 */
export function getSuggestedSearchTerms(
  iconData: IconData[],
  limit = 20
): string[] {
  const tagCounts = new Map<string, number>();

  iconData.forEach((icon) => {
    icon.metadata.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by frequency
    .slice(0, limit)
    .map(([tag]) => tag);
}

/**
 * Get related icons based on shared tags and categories
 * @param targetIcon - The icon to find related icons for
 * @param iconData - Array of icon data to search through
 * @param limit - Maximum number of related icons to return
 * @returns Array of related icons sorted by relevance score
 */
export function getRelatedIcons(
  targetIcon: IconData,
  iconData: IconData[],
  limit = 10
): IconData[] {
  const scores = new Map<string, number>();

  iconData.forEach((icon) => {
    if (icon.name === targetIcon.name) return; // Skip the target icon itself

    let score = 0;

    // Score based on shared categories (higher weight)
    const sharedCategories = icon.metadata.categories.filter((cat) =>
      targetIcon.metadata.categories.includes(cat)
    );
    score += sharedCategories.length * 3;

    // Score based on shared tags
    const sharedTags = icon.metadata.tags.filter((tag) =>
      targetIcon.metadata.tags.includes(tag)
    );
    score += sharedTags.length;

    if (score > 0) {
      scores.set(icon.name, score);
    }
  });

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by score
    .slice(0, limit)
    .map(([iconName]) => iconData.find((icon) => icon.name === iconName)!)
    .filter(Boolean);
}
