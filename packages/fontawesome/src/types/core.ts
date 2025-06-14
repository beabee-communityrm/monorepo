/**
 * Core FontAwesome type definitions
 */

export interface FontAwesomeFamilyStyle {
  family: string;
  style: string;
}

/**
 * FontAwesome icon interface
 */
export interface FontAwesome {
  name: string;
  label: string;
  unicode: string;
  styles: string[];
  searchTerms: string[];
  categories: string[];
  aliases?: string[];
}

/**
 * FontAwesome category interface
 */
export interface FontAwesomeCategory {
  id: string;
  label: string;
  icons: string[];
}

// Backwards compatibility alias
export type FontAwesomeIcon = FontAwesome;
