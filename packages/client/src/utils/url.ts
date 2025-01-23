import { stringify as _queryStringify } from 'qs';

/**
 * Removes duplicate forward slashes from a URL path
 * @param url - The URL string to clean
 * @returns Cleaned URL string with single forward slashes
 */
export const cleanUrl = (url: string): string => {
  return url.replaceAll("//", "/");
};

/**
 * Checks if a URL string starts with a protocol (e.g., http://, https://, ws://)
 * @param url - The URL string to check
 * @returns boolean indicating if the URL starts with a protocol
 * @example
 * hasProtocol('http://example.com') // Returns true
 * hasProtocol('/api/users') // Returns false
 */
export const hasProtocol = (url: string): boolean => {
  return Boolean(url.match(/^[a-z]+:\/\//));
};

/**
 * Stringifies query parameters
 * @param params The query parameters to stringify
 * @returns The stringified query parameters
 */
export const queryStringify = (params: Record<string, any>): string => {
  return _queryStringify(params, {
    arrayFormat: 'brackets',
    encode: true,
    encodeValuesOnly: true,
    strictNullHandling: true,
    skipNulls: false,
  });
};
