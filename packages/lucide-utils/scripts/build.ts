import { existsSync, mkdirSync, writeFileSync } from 'fs';
import * as icons from 'lucide';
import { join } from 'path';

import type {
  CategoryData,
  CategoryMetadata,
  IconData,
  IconMetadata,
} from '../src/types/icon-data.ts';
import { createAliasMapping } from '../src/utils/alias-mapping.ts';
import { camelToKebab } from '../src/utils/string.ts';

// Get current directory for Node.js script
const __dirname = process.cwd();

// Dynamic alias mapping - will be populated during build
let dynamicAliases: Record<string, string> = {};

/**
 * Load existing icon data if available to create alias mapping
 */
async function loadExistingIconData(): Promise<IconData[] | null> {
  try {
    const iconsPath = join(__dirname, 'src/data/icons.ts');
    if (!existsSync(iconsPath)) {
      return null;
    }

    // Dynamically import the existing icon data
    const { iconData } = await import('../src/data/icons.ts');
    return iconData;
  } catch (error) {
    console.info('No existing icon data found, starting fresh build...');
    return null;
  }
}

/**
 * Populate dynamic aliases from existing icon data
 */
function populateAliasMapping(existingIconData: IconData[]): void {
  dynamicAliases = createAliasMapping(existingIconData);
  console.log(
    `Loaded ${Object.keys(dynamicAliases).length} aliases from existing data`
  );
}

/**
 * Check if an icon name is likely an alias based on existing alias mappings
 */
function isLikelyAlias(kebabName: string): boolean {
  return Object.keys(dynamicAliases).includes(kebabName);
}

/**
 * Fetch metadata for a single icon
 */
async function fetchIconMetadata(
  kebabName: string
): Promise<IconMetadata | null> {
  try {
    // Skip known aliases - they don't have their own metadata
    if (isLikelyAlias(kebabName)) {
      console.info(
        `⏭ Skipping alias: ${kebabName} → ${dynamicAliases[kebabName]}`
      );
      return null;
    }

    const url = `https://raw.githubusercontent.com/lucide-icons/lucide/refs/heads/main/icons/${kebabName}.json`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(
        `⚠ Failed to fetch metadata for ${kebabName}: ${response.status}`
      );
      return null;
    }

    const metadata = await response.json();
    // Remove $schema property if it exists
    delete metadata.$schema;
    return metadata;
  } catch (error) {
    console.warn(`Error fetching metadata for ${kebabName}:`, error);
    return null;
  }
}

/**
 * Fetch category metadata
 */
async function fetchCategoryMetadata(
  categoryName: string
): Promise<CategoryMetadata | null> {
  const url = `https://raw.githubusercontent.com/lucide-icons/lucide/refs/heads/main/categories/${categoryName}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `Failed to fetch category metadata for ${categoryName}: ${response.status}`
      );
      return null;
    }
    const metadata = await response.json();
    // Remove $schema property if it exists
    delete metadata.$schema;
    return metadata;
  } catch (error) {
    console.warn(
      `Error fetching category metadata for ${categoryName}:`,
      error
    );
    return null;
  }
}

/**
 * Process all icons and fetch their metadata
 */
async function processIcons(): Promise<IconData[]> {
  const iconNames = Object.keys(icons).filter(
    (name) =>
      // Filter out non-icon exports (functions, etc.)
      typeof icons[name as keyof typeof icons] === 'object' &&
      name !== 'createLucideIcon' &&
      name !== 'Icon'
  );

  console.log(`Processing ${iconNames.length} icons...`);

  const processedIcons: IconData[] = [];
  const batchSize = 50; // Process in batches to avoid overwhelming the API

  for (let i = 0; i < iconNames.length; i += batchSize) {
    const batch = iconNames.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(iconNames.length / batchSize)}...`
    );

    const batchPromises = batch.map(async (iconName) => {
      const kebabName = camelToKebab(iconName);
      const metadata = await fetchIconMetadata(kebabName);

      if (metadata) {
        return {
          name: iconName,
          kebabName,
          metadata,
        };
      }
      return null;
    });

    const batchResults = await Promise.all(batchPromises);
    processedIcons.push(...(batchResults.filter(Boolean) as IconData[]));

    // Small delay between batches
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`Successfully processed ${processedIcons.length} icons`);
  return processedIcons;
}

/**
 * Extract and process unique categories
 */
async function processCategories(
  iconData: IconData[]
): Promise<CategoryData[]> {
  const categoryNames = new Set<string>();

  // Collect all unique categories
  iconData.forEach((icon) => {
    icon.metadata.categories.forEach((category) => {
      categoryNames.add(category);
    });
  });

  console.log(`Processing ${categoryNames.size} categories...`);

  const categoryPromises = Array.from(categoryNames).map(
    async (categoryName) => {
      const metadata = await fetchCategoryMetadata(categoryName);
      const iconCount = iconData.filter((icon) =>
        icon.metadata.categories.includes(categoryName)
      ).length;

      return {
        name: categoryName,
        title: metadata?.title || categoryName,
        description: metadata?.description,
        icon: metadata?.icon || 'folder',
        weight: metadata?.weight,
        iconCount,
      };
    }
  );

  const categories = await Promise.all(categoryPromises);

  // Sort by weight (if available) then by name
  categories.sort((a, b) => {
    if (a.weight !== undefined && b.weight !== undefined) {
      return a.weight - b.weight;
    }
    if (a.weight !== undefined) return -1;
    if (b.weight !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });

  console.log(`Successfully processed ${categories.length} categories`);
  return categories;
}

/**
 * Generate TypeScript files
 */
function generateFiles(iconData: IconData[], categories: CategoryData[]): void {
  const dataDir = join(__dirname, 'src/data');

  // Ensure data directory exists
  mkdirSync(dataDir, { recursive: true });

  // Generate icons data file
  const iconsContent = `// Auto-generated file - do not edit manually
// Generated on ${new Date().toISOString()}

import type { IconData } from '../types/icon-data.ts';

export const iconData: IconData[] = ${JSON.stringify(iconData, null, 2)};

export default iconData;
`;

  writeFileSync(join(dataDir, 'icons.ts'), iconsContent);
  console.log('Generated icons.ts');

  // Generate categories data file
  const categoriesContent = `// Auto-generated file - do not edit manually
// Generated on ${new Date().toISOString()}

import type { CategoryData } from '../types/icon-data.ts';

export const categoryData: CategoryData[] = ${JSON.stringify(categories, null, 2)};

export default categoryData;
`;

  writeFileSync(join(dataDir, 'categories.ts'), categoriesContent);
  console.log('Generated categories.ts');
}

/**
 * Main build function
 */
async function build(): Promise<void> {
  try {
    console.log('Starting Lucide icons metadata build...');

    // Try to load existing icon data to populate alias mapping
    const existingIconData = await loadExistingIconData();
    if (existingIconData) {
      populateAliasMapping(existingIconData);
    }

    const iconData = await processIcons();
    const categories = await processCategories(iconData);

    generateFiles(iconData, categories);

    console.log('Build completed successfully!');
    console.log(
      `Generated data for ${iconData.length} icons and ${categories.length} categories`
    );

    // If this was a fresh build without existing data, show improvement for next run
    if (!existingIconData) {
      console.log(
        '💡 Next build will use alias mapping from this data for better resolution!'
      );
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

// Run the build
build();
