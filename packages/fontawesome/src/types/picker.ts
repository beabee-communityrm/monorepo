/**
 * Icon picker type definitions
 */
import type { FontAwesome, FontAwesomeCategory } from './core';

/**
 * Category with additional statistics
 */
export interface CategoryWithStats extends FontAwesomeCategory {
  iconCount: number;
  popularIcons: FontAwesome[];
}

/**
 * Icon picker configuration
 */
export interface IconPickerConfig {
  /** Show category filter */
  showCategories?: boolean;
  /** Show style filter */
  showStyles?: boolean;
  /** Maximum number of icons to display */
  maxIcons?: number;
  /** Default search query */
  defaultQuery?: string;
  /** Default selected categories */
  defaultCategories?: string[];
  /** Default selected styles */
  defaultStyles?: string[];
  /** Enable fuzzy search */
  enableFuzzySearch?: boolean;
  /** Show icon recommendations */
  showRecommendations?: boolean;
}
