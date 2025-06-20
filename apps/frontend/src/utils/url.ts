import { isAbsoluteUrl } from '@beabee/beabee-common';

import env from '@env';

/**
 * Resolves an image URL to ensure it's absolute.
 * If the provided URL is relative (and not a blob URL), it prepends the API base URL.
 * Absolute URLs, blob URLs, or URLs already pointing to the API are returned as is.
 * Returns an empty string if the input is not a valid string.
 *
 * @param url - The image URL to process (can be relative or absolute).
 * @param width - The width of the image to be resolved.
 * @returns The resolved, absolute image URL or an empty string.
 */
export function resolveImageUrl(url: string | URL, width?: number): string {
  if (!url || typeof url !== 'string') {
    return '';
  }
  let urlObj: URL;
  if (isAbsoluteUrl(url)) {
    urlObj = new URL(url);
  } else if (url.startsWith('blob:')) {
    return url;
  } else if (url.startsWith(env.apiUrl)) {
    urlObj = new URL(url, env.appUrl);
  } else {
    urlObj = new URL(`${env.apiUrl}/${url}`, env.appUrl);
  }
  if (width) {
    urlObj.searchParams.set('w', width.toString());
  }
  return urlObj.toString();
}

export function isInternalUrl(url: string | undefined): url is string {
  return !!url && /^\/([^/]|$)/.test(url);
}
