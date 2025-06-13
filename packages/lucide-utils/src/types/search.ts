import type { IconData } from './icon-data.ts';

/**
 * Search configuration options
 */
export interface SearchOptions {
  query?: string;
  categories?: string[];
  includeDeprecated?: boolean;
  caseSensitive?: boolean;
}

/**
 * Search results interface
 */
export interface SearchResult {
  icons: IconData[];
  totalCount: number;
  categories: string[];
}

/**
 * Icon suggestion interface for search autocompletion
 */
export interface IconSuggestion {
  name: string;
  kebabName: string;
  tags: string[];
  categories: string[];
  aliases?: string[];
}
