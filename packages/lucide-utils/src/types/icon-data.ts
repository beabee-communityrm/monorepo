/**
 * Icon metadata interface based on Lucide's JSON schema
 */
export interface IconMetadata {
  contributors?: string[];
  tags: string[];
  categories: string[];
  aliases?: Array<
    | string
    | {
        name: string;
        deprecated?: boolean;
        deprecationReason?: string;
        toBeRemovedInVersion?: string;
      }
  >;
  deprecated?: boolean;
  deprecationReason?: string;
  toBeRemovedInVersion?: string;
}

/**
 * Processed icon data with both camelCase and kebab-case names
 */
export interface IconData {
  name: string;
  kebabName: string;
  metadata: IconMetadata;
}

/**
 * Category metadata interface based on Lucide's category schema
 */
export interface CategoryMetadata {
  description?: string;
  icon: string;
  title: string;
  weight?: number;
}

/**
 * Processed category data with additional computed fields
 */
export interface CategoryData {
  name: string;
  title: string;
  description?: string;
  icon: string;
  weight?: number;
  iconCount?: number;
}
