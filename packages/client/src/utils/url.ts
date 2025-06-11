/**
 * Removes duplicate forward slashes from a URL path
 * @param url - The URL string to clean
 * @returns Cleaned URL string with single forward slashes
 */
export const cleanUrl = (url: string): string => {
  return url.replaceAll('//', '/');
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
export const queryStringify = (obj: Record<string, any>): string => {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, item);
      });
    } else if (value instanceof Date) {
      params.append(key, value.toISOString());
    } else if (typeof value === 'object') {
      params.append(key, JSON.stringify(value));
    } else if (value !== undefined) {
      params.append(key, value.toString());
    }
  });

  return params.toString();
};
