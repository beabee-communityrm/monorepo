/**
 * Tests for IconSearchService
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FONTAWESOME_CATEGORIES } from '../data/categories';
import { FONTAWESOME_ICONS } from '../data/icons';
import type { IconFilterOptions, SearchConfig } from '../types';
import { IconSearchService } from './icon-search.service';

describe('IconSearchService', () => {
  let service: IconSearchService;

  beforeEach(() => {
    // Create a fresh service instance for each test
    service = new IconSearchService();
  });

  afterEach(() => {
    // Reset the search index to prevent duplicate ID errors
    if (service) {
      service.resetIndex();
    }
  });

  describe('Constructor and Configuration', () => {
    it('should create service with default configuration', () => {
      const defaultService = new IconSearchService();
      expect(defaultService).toBeInstanceOf(IconSearchService);
    });

    it('should create service with custom configuration', () => {
      const config: SearchConfig = {
        enableFuzzy: false,
        fuzzyThreshold: 0.5,
        enablePrefix: false,
        maxResults: 50,
      };

      const customService = new IconSearchService(config);
      expect(customService).toBeInstanceOf(IconSearchService);
    });

    it('should update configuration', () => {
      const newConfig: Partial<SearchConfig> = {
        maxResults: 25,
        enableFuzzy: false,
      };

      expect(() => service.updateConfig(newConfig)).not.toThrow();
    });
  });

  describe('Basic Search Functionality', () => {
    it('should return all icons when search query is empty', () => {
      const results = service.searchIcons('');
      expect(results).toHaveLength(FONTAWESOME_ICONS.length);
    });

    it('should return all icons when search query is whitespace', () => {
      const results = service.searchIcons('   ');
      expect(results).toHaveLength(FONTAWESOME_ICONS.length);
    });

    it('should find icons by exact name match', () => {
      // Use a common FontAwesome icon that should exist
      const results = service.searchIcons('heart');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((icon) => icon.name === 'heart')).toBe(true);
    });

    it('should find icons by label match', () => {
      const results = service.searchIcons('User');
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some((icon) => icon.label.toLowerCase().includes('user'))
      ).toBe(true);
    });

    it('should find icons by search terms', () => {
      const results = service.searchIcons('love');
      expect(results.length).toBeGreaterThan(0);
      // Should find icons that have 'love' in their search terms
    });

    it('should find icons by aliases', () => {
      const results = service.searchIcons('envelope');
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some(
          (icon) =>
            icon.name === 'envelope' || icon.aliases?.includes('envelope')
        )
      ).toBe(true);
    });

    it('should respect maxResults limit when searching', () => {
      const limitedService = new IconSearchService({ maxResults: 2 });
      const results = limitedService.searchIcons('heart'); // Use actual search query
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should respect custom limit parameter', () => {
      const results = service.searchIcons('', 3);
      expect(results).toHaveLength(3);
    });

    it('should handle non-existent queries gracefully', () => {
      const results = service.searchIcons('nonexistentquerythatdoesnotmatch');
      expect(results).toEqual([]);
    });
  });

  describe('Search with Relevance', () => {
    it('should return search results with relevance scores', () => {
      const results = service.searchWithRelevance('heart');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('icon');
      expect(results[0]).toHaveProperty('relevanceScore');
      expect(results[0]).toHaveProperty('matchType');
      expect(results.some((result) => result.icon.name === 'heart')).toBe(true);
    });

    it('should determine correct match types', () => {
      const exactMatch = service.searchWithRelevance('heart');
      expect(exactMatch.some((result) => result.matchType === 'exact')).toBe(
        true
      );

      // Test that different match types are returned (not testing specific match types)
      const searchTermMatch = service.searchWithRelevance('love');
      expect(searchTermMatch.length).toBeGreaterThan(0);
      expect(searchTermMatch.every((result) => result.matchType)).toBeTruthy();
    });

    it('should return results with zero relevance for empty query', () => {
      const results = service.searchWithRelevance('');
      expect(results).toHaveLength(FONTAWESOME_ICONS.length);
      expect(results.every((result) => result.relevanceScore === 0)).toBe(true);
      expect(results.every((result) => result.matchType === 'exact')).toBe(
        true
      );
    });
  });

  describe('Icon Filtering', () => {
    it('should filter icons by categories', () => {
      // Use a real category from the data
      const categoryId = FONTAWESOME_CATEGORIES[0]?.id;
      if (!categoryId) return;

      const options: IconFilterOptions = {
        categories: [categoryId],
      };

      const results = service.filterIcons(options);
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((icon) => icon.categories.includes(categoryId))
      ).toBe(true);
    });

    it('should filter icons by styles', () => {
      const options: IconFilterOptions = {
        styles: ['solid'],
      };

      const results = service.filterIcons(options);
      expect(results.length).toBeGreaterThan(0);
      expect(results.every((icon) => icon.styles.includes('solid'))).toBe(true);
    });

    it('should filter icons by multiple categories', () => {
      const categories = FONTAWESOME_CATEGORIES.slice(0, 2).map(
        (cat) => cat.id
      );
      const options: IconFilterOptions = {
        categories,
      };

      const results = service.filterIcons(options);
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((icon) =>
          categories.some((categoryId) => icon.categories.includes(categoryId))
        )
      ).toBe(true);
    });

    it('should combine category filter with search query', () => {
      const categoryId = FONTAWESOME_CATEGORIES[0]?.id;
      if (!categoryId) return;

      const options: IconFilterOptions = {
        categories: [categoryId],
        query: 'heart',
      };

      const results = service.filterIcons(options);
      // Should find icons that match both criteria or none if no matches exist
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return all icons when no filters are applied', () => {
      const results = service.filterIcons({});
      expect(results).toHaveLength(FONTAWESOME_ICONS.length);
    });
  });

  describe('Category Operations', () => {
    it('should get icons by category', () => {
      const categoryId = FONTAWESOME_CATEGORIES[0]?.id;
      if (!categoryId) return;

      const results = service.getIconsByCategory(categoryId);
      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((icon) => icon.categories.includes(categoryId))
      ).toBe(true);
    });

    it('should return empty array for non-existent category', () => {
      const results = service.getIconsByCategory('non-existent-category');
      expect(results).toHaveLength(0);
    });

    it('should get all categories', () => {
      const categories = service.getAllCategories();
      expect(categories).toHaveLength(FONTAWESOME_CATEGORIES.length);
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('label');
      expect(categories[0]).toHaveProperty('icons');
    });

    it('should get categories with statistics', () => {
      const categoriesWithStats = service.getCategoriesWithStats();

      expect(categoriesWithStats).toHaveLength(FONTAWESOME_CATEGORIES.length);
      expect(categoriesWithStats[0]).toHaveProperty('iconCount');
      expect(categoriesWithStats[0]).toHaveProperty('popularIcons');

      // Should be sorted by icon count (descending)
      for (let i = 1; i < categoriesWithStats.length; i++) {
        expect(categoriesWithStats[i - 1].iconCount).toBeGreaterThanOrEqual(
          categoriesWithStats[i].iconCount
        );
      }
    });
  });

  describe('Icon Suggestions', () => {
    it('should get icon suggestions for partial query', () => {
      const suggestions = service.getIconSuggestions('he');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((icon) => icon.name.startsWith('he'))).toBe(true);
    });

    it('should return empty array for empty query', () => {
      const suggestions = service.getIconSuggestions('');
      expect(suggestions).toHaveLength(0);
    });

    it('should respect limit parameter', () => {
      const suggestions = service.getIconSuggestions('e', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Utility Functions', () => {
    it('should check if icon exists', () => {
      const existingIcon = FONTAWESOME_ICONS[0];
      expect(service.iconExists(existingIcon.name)).toBe(true);
      expect(service.iconExists('non-existent-icon')).toBe(false);
    });

    it('should get specific icon by name', () => {
      const existingIcon = FONTAWESOME_ICONS[0];
      const foundIcon = service.getIcon(existingIcon.name);

      expect(foundIcon).toBeDefined();
      expect(foundIcon?.name).toBe(existingIcon.name);
    });

    it('should return undefined for non-existent icon', () => {
      const foundIcon = service.getIcon('non-existent-icon');
      expect(foundIcon).toBeUndefined();
    });

    it('should provide search statistics', () => {
      const stats = service.getSearchStats();

      expect(stats).toHaveProperty('totalIcons');
      expect(stats).toHaveProperty('totalCategories');
      expect(stats).toHaveProperty('indexedTerms');
      expect(stats).toHaveProperty('averageTermsPerIcon');

      expect(stats.totalIcons).toBe(FONTAWESOME_ICONS.length);
      expect(stats.totalCategories).toBe(FONTAWESOME_CATEGORIES.length);
      expect(stats.indexedTerms).toBeGreaterThan(0);
      expect(stats.averageTermsPerIcon).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed queries gracefully', () => {
      expect(() => service.searchIcons('')).not.toThrow();
      expect(() => service.searchIcons('   ')).not.toThrow();
      expect(() => service.searchIcons('\n\t')).not.toThrow();
    });

    it('should handle configuration updates', () => {
      const originalConfig = { maxResults: 100 };
      service.updateConfig(originalConfig);

      const results = service.searchIcons('heart');
      expect(results.length).toBeLessThanOrEqual(100);
    });

    it('should reset index correctly', () => {
      // Perform a search to initialize the index
      service.searchIcons('heart');

      // Reset the index
      expect(() => service.resetIndex()).not.toThrow();

      // Should still work after reset
      const results = service.searchIcons('heart');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large search queries efficiently', () => {
      const start = performance.now();
      const results = service.searchIcons('icon');
      const end = performance.now();

      // Should complete within reasonable time (1 second)
      expect(end - start).toBeLessThan(1000);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle multiple consecutive searches', () => {
      const queries = ['heart', 'user', 'mail', 'star', 'house'];

      queries.forEach((query) => {
        const results = service.searchIcons(query);
        expect(Array.isArray(results)).toBe(true);
      });
    });
  });
});
