import env from '@env';
import { isAbsoluteUrl } from '@beabee/beabee-common';

/**
 * Resolves an image URL to ensure it's absolute.
 * If the provided URL is relative (and not a blob URL), it prepends the API base URL.
 * Absolute URLs, blob URLs, or URLs already pointing to the API are returned as is.
 * Returns an empty string if the input is not a valid string.
 *
 * @param url - The image URL to process (can be relative or absolute).
 * @returns The resolved, absolute image URL or an empty string.
 */
export function resolveImageUrl(url: unknown): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  if (isAbsoluteUrl(url) || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith(env.apiUrl)) {
    return url;
  }
  return `${env.apiUrl}/${url.replace(/^\//, '')}`;
}
