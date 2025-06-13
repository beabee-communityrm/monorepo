/**
 * Convert camelCase to kebab-case
 * @param str - The camelCase string to convert
 * @returns The kebab-case string
 *
 * @example
 * camelToKebab('HelloWorld') // 'hello-world'
 * camelToKebab('iconName') // 'icon-name'
 * camelToKebab('Music2') // 'music-2'
 * camelToKebab('Clock12') // 'clock-12'
 * camelToKebab('Heading1') // 'heading-1'
 * camelToKebab('Move3d') // 'move3d' (3d is a special case)
 * camelToKebab('Axis3D') // 'axis3d' (3D is a special case)
 */
export function camelToKebab(str: string): string {
  return (
    str
      // Handle special case: 3D should stay as 3d (e.g., Move3D -> move3d, Axis3D -> axis3d)
      .replace(/3[dD]\b/g, '3d')
      // Insert dash between lowercase/number and uppercase letter
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // Insert dash between letter and number, but NOT for the 3d we just handled
      .replace(/([a-zA-Z])(\d)(?!d\b)/gi, '$1-$2')
      // Insert dash between number and letter, but NOT for the 3d we just handled
      .replace(/(\d)([a-zA-Z])(?!d\b)/gi, '$1-$2')
      .toLowerCase()
  );
}

/**
 * Normalize a search term for comparison
 * @param term - The term to normalize
 * @param caseSensitive - Whether to preserve case sensitivity
 * @returns The normalized term
 */
export function normalizeSearchTerm(
  term: string,
  caseSensitive = false
): string {
  return caseSensitive ? term.trim() : term.toLowerCase().trim();
}

/**
 * Convert kebab-case to camelCase
 * @param str - The kebab-case string to convert
 * @returns The camelCase string
 *
 * @example
 * kebabToCamel('hello-world') // 'helloWorld'
 * kebabToCamel('icon-name') // 'iconName'
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
