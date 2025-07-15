/**
 * Utility functions for generating unique IDs for components
 */

/**
 * Generate a random string for use in IDs
 * @param length Length of the random string (default: 9)
 * @returns Random alphanumeric string
 */
function generateRandomString(length: number = 9): string {
  // Use crypto.getRandomValues for better randomness if available, fallback to Math.random
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Generate a unique ID with optional prefix and additional parts
 * @param prefix Prefix for the ID (e.g., 'input', 'modal')
 * @param parts Additional parts to include in the ID (e.g., component name)
 * @param length Length of the random part (default: 9)
 * @returns Unique ID string
 */
export function generateUniqueId(
  prefix: string,
  parts: string[] = [],
  length: number = 9
): string {
  const randomPart = generateRandomString(length);
  const allParts = [prefix, ...parts.filter(Boolean), randomPart];
  return allParts.join('-');
}
