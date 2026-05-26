/**
 * Escape special regex characters in a string.
 *
 * @param str The string to escape
 * @returns The escaped string safe for use in regex patterns
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
