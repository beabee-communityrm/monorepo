/**
 * Search and filtering type definitions
 */
import type { FontAwesome } from './core';

/**
 * Configuration for the search service
 */
export interface SearchConfig {
  /** Enable fuzzy matching */
  enableFuzzy?: boolean;
  /** Fuzzy matching threshold (0-1) */
  fuzzyThreshold?: number;
  /** Enable prefix matching */
  enablePrefix?: boolean;
  /** Maximum number of results to return */
  maxResults?: number;
}

/**
 * Options for filtering icons
 */
export interface IconFilterOptions {
  query?: string;
  categories?: string[];
  styles?: string[];
  limit?: number;
}

/**
 * Search result with relevance scoring
 */
export interface SearchResult {
  icon: FontAwesome;
  relevanceScore: number;
  matchType: 'exact' | 'starts-with' | 'contains' | 'search-terms' | 'aliases';
}
