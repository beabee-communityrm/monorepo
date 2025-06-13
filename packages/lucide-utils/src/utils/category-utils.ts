import type { CategoryData, IconData } from '../types/icon-data.ts';

/**
 * Get icons by specific categories
 * @param iconData - Array of icon data to filter
 * @param categories - Array of category names to filter by
 * @returns Filtered array of icons that belong to the specified categories
 */
export function getIconsByCategories(
  iconData: IconData[],
  categories: string[]
): IconData[] {
  return filterByCategories(iconData, categories);
}

/**
 * Filter icons by categories
 * @param icons - Array of icons to filter
 * @param categories - Array of category names to filter by
 * @returns Filtered array of icons
 */
export function filterByCategories(
  icons: IconData[],
  categories: string[]
): IconData[] {
  if (!categories || categories.length === 0) return icons;

  return icons.filter((icon) =>
    categories.some((category) => icon.metadata.categories.includes(category))
  );
}

/**
 * Get all available categories with icon counts
 * @param iconData - Array of icon data to analyze
 * @param categoryData - Array of category metadata
 * @returns Array of categories with updated icon counts
 */
export function getAvailableCategories(
  iconData: IconData[],
  categoryData: CategoryData[]
): CategoryData[] {
  // Count icons per category
  const categoryCounts = new Map<string, number>();

  iconData.forEach((icon) => {
    icon.metadata.categories.forEach((category) => {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });
  });

  // Update category data with actual counts
  return categoryData
    .map((category) => ({
      ...category,
      iconCount: categoryCounts.get(category.name) || 0,
    }))
    .filter((category) => category.iconCount > 0);
}
