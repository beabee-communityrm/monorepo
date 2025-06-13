import type { IconData } from '../types/icon-data.ts';
import { camelToKebab } from './string.ts';

/**
 * Validate if an icon name exists (including aliases)
 * @param iconName - The icon name to validate (supports camelCase, kebab-case, and aliases)
 * @param iconData - Array of icon data to search in
 * @returns True if the icon exists, false otherwise
 */
export function iconExists(iconName: string, iconData: IconData[]): boolean {
  // Check direct name matches
  const directMatch = iconData.some(
    (icon) => icon.name === iconName || icon.kebabName === iconName
  );

  if (directMatch) return true;

  // Check aliases
  return iconData.some((icon) => {
    if (!icon.metadata.aliases) return false;

    return icon.metadata.aliases.some((alias) => {
      const aliasName = typeof alias === 'string' ? alias : alias.name;
      return aliasName === iconName || camelToKebab(aliasName) === iconName;
    });
  });
}

/**
 * Get icon data by name (supports both camelCase and kebab-case, and aliases)
 * @param iconName - The icon name to find
 * @param iconData - Array of icon data to search in
 * @returns The icon data if found, undefined otherwise
 */
export function getIconByName(
  iconName: string,
  iconData: IconData[]
): IconData | undefined {
  // First check direct name matches
  let foundIcon = iconData.find(
    (icon) => icon.name === iconName || icon.kebabName === iconName
  );

  // If not found, check aliases
  if (!foundIcon) {
    foundIcon = iconData.find((icon) => {
      if (!icon.metadata.aliases) return false;

      return icon.metadata.aliases.some((alias) => {
        const aliasName = typeof alias === 'string' ? alias : alias.name;
        return aliasName === iconName || camelToKebab(aliasName) === iconName;
      });
    });
  }

  return foundIcon;
}
