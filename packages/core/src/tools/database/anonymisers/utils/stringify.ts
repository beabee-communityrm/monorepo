/**
 * Utility functions for stringifying data structures
 */

/**
 * Stringify helper that handles Map objects
 * Maps don't stringify well by default, so convert them to arrays
 */
export function stringify(value: any): string {
  return JSON.stringify(value, (key: string, value: any): any => {
    return value instanceof Map ? [...value] : value;
  });
}
