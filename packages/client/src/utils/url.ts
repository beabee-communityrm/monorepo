/**
 * Removes duplicate forward slashes from a URL path
 * @param url - The URL string to clean
 * @returns Cleaned URL string with single forward slashes
 */
export const cleanUrl = (url: string): string => {
  return url.replaceAll("//", "/");
};

/**
 * Converts an object to URL search parameters and appends them to a URL
 * Handles complex data types like arrays, dates, and nested objects
 * @param params - Object to convert to query string
 * @param url - URL to append parameters to
 * @returns Modified URL with search params
 * @example
 * objToQueryString({ page: 1, filters: { active: true } }, new URL('http://api.example.com'))
 * // Returns URL with "page=1&filters=%7B%22active%22%3Atrue%7D" as search params
 */
// deno-lint-ignore no-explicit-any
export function objToQueryString(obj: Record<string, any>, url: URL): URL {
  const params = new URLSearchParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, item);
      });
    } else if (value instanceof Date) {
      params.append(key, value.toISOString());
    } else if (value === null) {
      params.append(key, "null");
    } else if (typeof value === "object") {
      Object.entries(value).forEach(([subKey, subValue]) => {
        params.append(subKey, subValue?.toString() ?? "");
      });
    } else {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    }
  });

  url.search = params.toString();
  return url;
}

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
