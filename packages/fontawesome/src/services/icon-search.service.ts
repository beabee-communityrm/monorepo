/**
 * FontAwesome Icon Search Service
 *
 * Provides icon search and filtering functionality for icon pickers.
 * Uses MiniSearch for efficient full-text search capabilities.
 */
import MiniSearch from 'minisearch';

import { FONTAWESOME_CATEGORIES } from '../data/categories';
import { FONTAWESOME_ICONS } from '../data/icons';
import type {
  CategoryWithStats,
  FontAwesome,
  FontAwesomeCategory,
  IconFilterOptions,
  SearchConfig,
  SearchResult,
} from '../types';

/**
 * Service class for FontAwesome icon search and filtering operations
 */
export class IconSearchService {
  private searchIndex: MiniSearch<FontAwesome> | null = null;
  private config: Required<SearchConfig>;

  constructor(config: SearchConfig = {}) {
    this.config = {
      enableFuzzy: true,
      fuzzyThreshold: 0.2,
      enablePrefix: true,
      maxResults: 1000,
      ...config,
    };
  }

  /**
   * Initialize the search index with optimized fields for icon picking
   */
  private initializeSearchIndex(): MiniSearch<FontAwesome> {
    if (this.searchIndex) {
      return this.searchIndex;
    }

    this.searchIndex = new MiniSearch<FontAwesome>({
      // Use 'name' as the unique ID field
      idField: 'name',
      // Only index search-relevant fields
      fields: ['name', 'label', 'searchTerms', 'aliases', 'categories'],
      // Store all fields needed by icon picker
      storeFields: [
        'name',
        'label',
        'unicode',
        'styles',
        'searchTerms',
        'categories',
        'aliases',
        'voted',
      ],
      searchOptions: {
        boost: {
          name: 4, // Icon name is most important for exact matches
          label: 3, // Label is secondary
          searchTerms: 2, // Search terms are moderately important
          aliases: 1.5, // Aliases are less important
          categories: 1, // Categories are least important for text search
        },
        prefix: this.config.enablePrefix,
        fuzzy: this.config.enableFuzzy ? this.config.fuzzyThreshold : false,
        combineWith: 'AND',
      },
      extractField: (document, fieldName) => {
        const value = document[fieldName as keyof FontAwesome];

        if (Array.isArray(value)) {
          return value.join(' ');
        }

        return typeof value === 'string' ? value : '';
      },
    });

    // Filter out any icons with duplicate names to avoid MiniSearch duplicate ID errors
    const uniqueIcons = FONTAWESOME_ICONS.filter(
      (icon, index, arr) => arr.findIndex((i) => i.name === icon.name) === index
    );

    // Index unique icons only
    this.searchIndex.addAll(uniqueIcons);
    return this.searchIndex;
  }

  /**
   * Search icons by query with basic filtering
   */
  public searchIcons(query: string, limit?: number): FontAwesome[] {
    if (!query.trim()) {
      // For empty queries, return all icons unless explicitly limited
      // This allows "show all icons" functionality while respecting explicit limits
      if (limit !== undefined) {
        return FONTAWESOME_ICONS.slice(0, limit);
      }
      // Only apply maxResults config for actual searches, not for "show all" scenarios
      return FONTAWESOME_ICONS;
    }

    const index = this.initializeSearchIndex();
    const results = index.search(query);

    const icons = results
      .slice(0, limit || this.config.maxResults)
      .map((result) => this.mapSearchResultToIcon(result));

    return icons;
  }

  /**
   * Advanced search with detailed relevance scoring
   */
  public searchWithRelevance(query: string, limit?: number): SearchResult[] {
    if (!query.trim()) {
      // For empty queries, return all icons unless explicitly limited
      // This allows "show all icons" functionality while respecting explicit limits
      let iconsToReturn = FONTAWESOME_ICONS;
      if (limit !== undefined) {
        iconsToReturn = FONTAWESOME_ICONS.slice(0, limit);
      }
      return iconsToReturn.map((icon) => ({
        icon,
        relevanceScore: 0,
        matchType: 'exact' as const,
      }));
    }

    const index = this.initializeSearchIndex();
    const results = index.search(query, {
      boost: {
        name: 5,
        label: 3,
        searchTerms: 2,
        aliases: 1.5,
        categories: 1,
      },
    });

    return results.slice(0, limit || this.config.maxResults).map((result) => {
      const icon = this.mapSearchResultToIcon(result);
      const matchType = this.determineMatchType(query, icon);

      return {
        icon,
        relevanceScore: result.score,
        matchType,
      };
    });
  }

  /**
   * Filter icons by categories, styles, and optional search query
   */
  public filterIcons(options: IconFilterOptions): FontAwesome[] {
    let filteredIcons = FONTAWESOME_ICONS;

    // Filter by categories
    if (options.categories?.length) {
      filteredIcons = filteredIcons.filter((icon) =>
        options.categories!.some((categoryId) =>
          icon.categories.includes(categoryId)
        )
      );
    }

    // Filter by styles
    if (options.styles?.length) {
      filteredIcons = filteredIcons.filter((icon) =>
        options.styles!.some((style) => icon.styles.includes(style))
      );
    }

    // Apply search query if provided
    if (options.query?.trim()) {
      const searchResults = this.searchIconsInSet(filteredIcons, options.query);
      return searchResults;
    }

    return filteredIcons;
  }

  /**
   * Get icons by specific category
   */
  public getIconsByCategory(categoryId: string): FontAwesome[] {
    return FONTAWESOME_ICONS.filter((icon) =>
      icon.categories.includes(categoryId)
    );
  }

  /**
   * Get categories with statistics for icon picker
   */
  public getCategoriesWithStats(): CategoryWithStats[] {
    return FONTAWESOME_CATEGORIES.map((category) => {
      const categoryIcons = this.getIconsByCategory(category.id);

      // Get popular icons (those with more search terms indicate popularity)
      const popularIcons = categoryIcons
        .sort((a, b) => b.searchTerms.length - a.searchTerms.length)
        .slice(0, 5);

      return {
        ...category,
        iconCount: categoryIcons.length,
        popularIcons,
      };
    }).sort((a, b) => b.iconCount - a.iconCount);
  }

  /**
   * Get icon suggestions for autocomplete
   */
  public getIconSuggestions(
    partialQuery: string,
    limit: number = 10
  ): FontAwesome[] {
    if (!partialQuery.trim()) {
      return [];
    }

    const index = this.initializeSearchIndex();
    const results = index.search(partialQuery, {
      prefix: true,
      boost: {
        name: 5,
        label: 3,
        searchTerms: 1,
      },
    });

    return results
      .slice(0, limit)
      .map((result) => this.mapSearchResultToIcon(result));
  }

  /**
   * Check if an icon exists by name
   */
  public iconExists(iconName: string): boolean {
    return FONTAWESOME_ICONS.some((icon) => icon.name === iconName);
  }

  /**
   * Get a specific icon by name
   */
  public getIcon(iconName: string): FontAwesome | undefined {
    return FONTAWESOME_ICONS.find((icon) => icon.name === iconName);
  }

  /**
   * Get all available categories
   */
  public getAllCategories(): FontAwesomeCategory[] {
    return FONTAWESOME_CATEGORIES;
  }

  /**
   * Get search statistics
   */
  public getSearchStats() {
    const totalIcons = FONTAWESOME_ICONS.length;
    const totalSearchTerms = FONTAWESOME_ICONS.reduce(
      (sum, icon) =>
        sum + icon.searchTerms.length + (icon.aliases?.length || 0),
      0
    );

    return {
      totalIcons,
      totalCategories: FONTAWESOME_CATEGORIES.length,
      indexedTerms: totalSearchTerms,
      averageTermsPerIcon:
        Math.round((totalSearchTerms / totalIcons) * 100) / 100,
    };
  }

  /**
   * Reset the search index (useful for testing)
   */
  public resetIndex(): void {
    this.searchIndex = null;
  }

  /**
   * Update service configuration
   */
  public updateConfig(newConfig: Partial<SearchConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.resetIndex(); // Force re-initialization with new config
  }

  // Private helper methods

  /**
   * Search within a specific set of icons
   */
  private searchIconsInSet(
    iconSet: FontAwesome[],
    query: string
  ): FontAwesome[] {
    if (iconSet.length === FONTAWESOME_ICONS.length) {
      return this.searchIcons(query);
    }

    // Create temporary index for subset
    const tempIndex = new MiniSearch<FontAwesome>({
      // Use 'name' as the unique ID field
      idField: 'name',
      fields: ['name', 'label', 'searchTerms', 'aliases', 'categories'],
      storeFields: [
        'name',
        'label',
        'unicode',
        'styles',
        'searchTerms',
        'categories',
        'aliases',
        'voted',
      ],
      extractField: (document, fieldName) => {
        const value = document[fieldName as keyof FontAwesome];
        return Array.isArray(value) ? value.join(' ') : String(value || '');
      },
    });

    // Filter out any icons with duplicate names to avoid MiniSearch duplicate ID errors
    const uniqueIconSet = iconSet.filter(
      (icon, index, arr) => arr.findIndex((i) => i.name === icon.name) === index
    );

    tempIndex.addAll(uniqueIconSet);
    const results = tempIndex.search(query);

    return results.map((result) => this.mapSearchResultToIcon(result));
  }

  /**
   * Map MiniSearch result to FontAwesome icon
   */
  private mapSearchResultToIcon(result: any): FontAwesome {
    return {
      name: result.name,
      label: result.label,
      unicode: result.unicode,
      styles: Array.isArray(result.styles) ? result.styles : [],
      searchTerms: Array.isArray(result.searchTerms) ? result.searchTerms : [],
      categories: Array.isArray(result.categories) ? result.categories : [],
      aliases: Array.isArray(result.aliases) ? result.aliases : undefined,
      voted: result.voted || false,
    };
  }

  /**
   * Determine the type of match for search results
   */
  private determineMatchType(
    query: string,
    icon: FontAwesome
  ): SearchResult['matchType'] {
    const normalizedQuery = query.toLowerCase().trim();
    const iconName = icon.name.toLowerCase();
    const iconLabel = icon.label.toLowerCase();

    if (iconName === normalizedQuery || iconLabel === normalizedQuery) {
      return 'exact';
    }

    if (
      iconName.startsWith(normalizedQuery) ||
      iconLabel.startsWith(normalizedQuery)
    ) {
      return 'starts-with';
    }

    if (
      icon.searchTerms.some((term) => term.toLowerCase() === normalizedQuery)
    ) {
      return 'search-terms';
    }

    if (
      icon.aliases?.some((alias) => alias.toLowerCase() === normalizedQuery)
    ) {
      return 'aliases';
    }

    return 'contains';
  }
}
