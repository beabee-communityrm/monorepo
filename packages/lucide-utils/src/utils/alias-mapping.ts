import type { IconData } from '../types/icon-data.ts';
import { camelToKebab } from './string.ts';

/**
 * Create alias mapping from icon metadata
 * Maps alias names (kebab-case) to their target icon names (kebab-case)
 */
export function createAliasMapping(
  iconData: IconData[]
): Record<string, string> {
  const aliasMap: Record<string, string> = {};

  iconData.forEach((icon) => {
    if (icon.metadata.aliases) {
      icon.metadata.aliases.forEach((alias) => {
        const aliasName = typeof alias === 'string' ? alias : alias.name;
        const aliasKebab = camelToKebab(aliasName);
        const targetKebab = icon.kebabName;

        // Only add if it's not deprecated (or if we want to include deprecated aliases)
        const isDeprecated = typeof alias === 'object' && alias.deprecated;
        if (!isDeprecated) {
          aliasMap[aliasKebab] = targetKebab;
        }
      });
    }
  });

  return aliasMap;
}

/**
 * Find the target icon name for a given alias
 */
export function resolveAlias(
  aliasName: string,
  iconData: IconData[]
): string | null {
  const aliasMapping = createAliasMapping(iconData);
  return aliasMapping[aliasName] || null;
}

/**
 * Check if a name is an alias
 */
export function isAlias(name: string, iconData: IconData[]): boolean {
  const aliasMapping = createAliasMapping(iconData);
  return name in aliasMapping;
}
