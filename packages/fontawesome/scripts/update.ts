#!/usr/bin/env -S node --experimental-specifier-resolution=node --experimental-strip-types --no-warnings
import { readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import Module from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

import type {
  ProcessedFontAwesomeCategory,
  ProcessedFontAwesomeIcon,
  RawFontAwesomeCategory,
  RawFontAwesomeFamilyData,
  RawFontAwesomeIcon,
} from '../src/types/metadata';

const require = Module.createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration for the metadata processing
 */
const CONFIG = {
  // FontAwesome metadata file paths
  METADATA_PATHS: {
    iconFamilies: require.resolve(
      '@fortawesome/fontawesome-free/metadata/icon-families.yml'
    ),
    icons: require.resolve('@fortawesome/fontawesome-free/metadata/icons.yml'),
    categories: require.resolve(
      '@fortawesome/fontawesome-free/metadata/categories.yml'
    ),
  },
  // Output directory
  OUTPUT_DIR: join(__dirname, '..', 'src', 'data'),
  // File generation settings
  GENERATION: {
    includeTimestamp: true,
    prettyPrint: true,
    indentSize: 2,
  },
} as const;

/**
 * Loads and parses a YAML file
 */
async function loadYamlFile<T = Record<string, any>>(
  filePath: string
): Promise<T> {
  try {
    console.log(`📂 Loading YAML file: ${filePath}`);
    const content = readFileSync(filePath, 'utf-8');
    const parsed = parse(content) as T;
    console.log(`✅ Successfully loaded YAML file`);
    return parsed;
  } catch (error) {
    console.error(`❌ Error loading YAML file ${filePath}:`, error);
    throw new Error(`Failed to load YAML file: ${filePath}`);
  }
}

/**
 * Creates a mapping from icons to their categories
 */
function createIconToCategoriesMap(
  categoriesData: Record<string, RawFontAwesomeCategory>
): Map<string, string[]> {
  const iconToCategoriesMap = new Map<string, string[]>();

  for (const [categoryId, categoryData] of Object.entries(categoriesData)) {
    for (const iconName of categoryData.icons) {
      if (!iconToCategoriesMap.has(iconName)) {
        iconToCategoriesMap.set(iconName, []);
      }
      iconToCategoriesMap.get(iconName)!.push(categoryId);
    }
  }

  return iconToCategoriesMap;
}

/**
 * Processes raw icon data into the final format
 */
function processIcon(
  iconName: string,
  iconData: RawFontAwesomeIcon,
  familyData: RawFontAwesomeFamilyData | undefined,
  iconCategories: string[]
): ProcessedFontAwesomeIcon {
  // Extract styles from free version of familyStylesByLicense, fallback to original styles
  const freeStyles =
    familyData?.familyStylesByLicense?.free?.map((item) => item.style) || [];
  const styles = freeStyles.length > 0 ? freeStyles : iconData.styles || [];

  return {
    name: iconName,
    label: iconData.label || iconName,
    unicode: iconData.unicode || '',
    styles,
    searchTerms: iconData.search?.terms || [],
    categories: iconCategories,
    aliases: iconData.aliases?.names?.length
      ? iconData.aliases.names
      : undefined,
  };
}

/**
 * Processes raw category data into the final format
 */
function processCategory(
  categoryId: string,
  categoryData: RawFontAwesomeCategory
): ProcessedFontAwesomeCategory {
  return {
    id: categoryId,
    label: categoryData.label,
    icons: categoryData.icons,
  };
}

/**
 * Loads and processes all FontAwesome metadata
 */
async function processMetadata(): Promise<{
  icons: ProcessedFontAwesomeIcon[];
  categories: ProcessedFontAwesomeCategory[];
}> {
  console.log('🚀 Starting FontAwesome metadata processing...');

  // Load all YAML files in parallel
  const [iconsData, iconFamiliesData, categoriesData] = await Promise.all([
    loadYamlFile<Record<string, RawFontAwesomeIcon>>(
      CONFIG.METADATA_PATHS.icons
    ),
    loadYamlFile<Record<string, RawFontAwesomeFamilyData>>(
      CONFIG.METADATA_PATHS.iconFamilies
    ),
    loadYamlFile<Record<string, RawFontAwesomeCategory>>(
      CONFIG.METADATA_PATHS.categories
    ),
  ]);

  console.log(`📊 Loaded ${Object.keys(iconsData).length} icons`);
  console.log(`📊 Loaded ${Object.keys(categoriesData).length} categories`);

  // Create mapping from icons to categories
  const iconToCategoriesMap = createIconToCategoriesMap(categoriesData);

  // Process categories
  const categories: ProcessedFontAwesomeCategory[] = Object.entries(
    categoriesData
  ).map(([categoryId, categoryData]) =>
    processCategory(categoryId, categoryData)
  );

  // Process icons
  const icons: ProcessedFontAwesomeIcon[] = Object.entries(iconsData).map(
    ([iconName, iconData]) => {
      const familyData = iconFamiliesData[iconName];
      const iconCategories = iconToCategoriesMap.get(iconName) || [];
      return processIcon(iconName, iconData, familyData, iconCategories);
    }
  );

  console.log(
    `✅ Processed ${icons.length} icons and ${categories.length} categories`
  );
  return { icons, categories };
}

/**
 * Generates the TypeScript file header
 */
function generateFileHeader(description: string): string {
  const timestamp = CONFIG.GENERATION.includeTimestamp
    ? `// Generated on ${new Date().toISOString()}\n`
    : '';

  return `// Auto-generated file - do not edit manually
${timestamp}// ${description}

`;
}

/**
 * Generates the icons TypeScript file
 */
async function generateIconsFile(
  icons: ProcessedFontAwesomeIcon[]
): Promise<void> {
  const content = `${generateFileHeader('FontAwesome icons data')}import type { FontAwesome } from '../types';

export const FONTAWESOME_ICONS: FontAwesome[] = ${JSON.stringify(
    icons,
    [
      'name',
      'label',
      'unicode',
      'styles',
      'searchTerms',
      'categories',
      'aliases',
    ],
    CONFIG.GENERATION.indentSize
  )};

export default FONTAWESOME_ICONS;
`;

  const filePath = join(CONFIG.OUTPUT_DIR, 'icons.ts');
  await writeFile(filePath, content);
  console.log(
    `📄 Generated icons file with ${icons.length} icons: ${filePath}`
  );
}

/**
 * Generates the categories TypeScript file
 */
async function generateCategoriesFile(
  categories: ProcessedFontAwesomeCategory[]
): Promise<void> {
  const content = `${generateFileHeader('FontAwesome categories data')}import type { FontAwesomeCategory } from '../types';

export const FONTAWESOME_CATEGORIES: FontAwesomeCategory[] = ${JSON.stringify(
    categories,
    null,
    CONFIG.GENERATION.indentSize
  )};

export default FONTAWESOME_CATEGORIES;
`;

  const filePath = join(CONFIG.OUTPUT_DIR, 'categories.ts');
  await writeFile(filePath, content);
  console.log(
    `📄 Generated categories file with ${categories.length} categories: ${filePath}`
  );
}

/**
 * Main function that orchestrates the metadata processing
 */
async function main(): Promise<void> {
  try {
    console.log('🎯 Starting FontAwesome metadata processing...');

    // Ensure output directory exists
    await mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

    // Process metadata
    const { icons, categories } = await processMetadata();

    // Generate all files in parallel
    await Promise.all([
      generateIconsFile(icons),
      generateCategoriesFile(categories),
    ]);

    console.log('🎉 FontAwesome metadata processing completed successfully!');
    console.log(
      `📊 Generated data for ${icons.length} icons and ${categories.length} categories`
    );
    console.log('💡 Remember to update types and utils manually if needed');
  } catch (error) {
    console.error('❌ Error processing FontAwesome metadata:', error);
    process.exit(1);
  }
}

// Execute the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
