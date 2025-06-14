/**
 * FontAwesome metadata processing types
 */

/**
 * Raw FontAwesome icon data from metadata files
 */
export interface RawFontAwesomeIcon {
  label?: string;
  unicode?: string;
  styles?: string[];
  search?: {
    terms?: string[];
  };
  aliases?: {
    names?: string[];
  };
  changes?: string[];
  voted?: boolean;
}

/**
 * Raw FontAwesome category data from metadata files
 */
export interface RawFontAwesomeCategory {
  label: string;
  icons: string[];
}

/**
 * Raw FontAwesome family data from metadata files
 */
export interface RawFontAwesomeFamilyData {
  familyStylesByLicense?: {
    free?: Array<{ family: string; style: string }>;
    pro?: Array<{ family: string; style: string }>;
  };
}

/**
 * Processed FontAwesome icon for generation
 */
export interface ProcessedFontAwesomeIcon {
  name: string;
  label: string;
  unicode: string;
  styles: string[];
  searchTerms: string[];
  categories: string[];
  aliases?: string[];
}

/**
 * Processed FontAwesome category for generation
 */
export interface ProcessedFontAwesomeCategory {
  id: string;
  label: string;
  icons: string[];
}
