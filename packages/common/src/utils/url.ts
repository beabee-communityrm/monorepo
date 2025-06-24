export const isAbsoluteUrl = (url: string): boolean =>
  url && (isBlobUrl(url) || /^https?:\/\//i.test(url));

export const isBlobUrl = (url: string): boolean =>
  url && url.startsWith('blob:');

/**
 * Resolves an image URL to ensure it's absolute.
 * If the provided URL is relative (and not a blob URL), it prepends the API base URL.
 * Absolute URLs, blob URLs, or URLs already pointing to the API are returned as is.
 * Returns an empty string if the input is not a valid string.
 *
 * @param url - The image URL to process (can be relative or absolute).
 * @param apiBaseUrl - The base URL for API endpoints (e.g., '/api/1.0/').
 * @param appBaseUrl - The base URL for the application (e.g., 'https://example.com').
 * @param width - Optional width parameter for image resizing.
 * @returns The resolved, absolute image URL or an empty string.
 */
export function resolveImageUrl(
  url: string | URL,
  apiBaseUrl: string,
  appBaseUrl: string,
  width?: number
): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  let urlObj: URL;

  if (isAbsoluteUrl(url)) {
    urlObj = new URL(url);
  } else if (url.startsWith('blob:')) {
    return url;
  } else if (url.startsWith(apiBaseUrl)) {
    urlObj = new URL(url, appBaseUrl);
  } else {
    // Remove leading slash if present to avoid double slashes
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    // Remove trailing slash from apiBaseUrl if present
    const cleanApiBaseUrl = apiBaseUrl.endsWith('/')
      ? apiBaseUrl.slice(0, -1)
      : apiBaseUrl;
    urlObj = new URL(`${cleanApiBaseUrl}/${cleanUrl}`, appBaseUrl);
  }

  if (width) {
    urlObj.searchParams.set('w', width.toString());
  }

  return urlObj.toString();
}
