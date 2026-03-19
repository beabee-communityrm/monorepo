import { resolveImageUrl as resolveImageUrlCommon } from '@beabee/beabee-common';

import env from '#env';

/**
 * Resolves an image URL to ensure it's absolute.
 * This is a wrapper around the common resolveImageUrl function that provides
 * the frontend-specific API and app base URLs.
 *
 * @param url - The image URL to process (can be relative or absolute).
 * @param width - The width of the image to be resolved.
 * @returns The resolved, absolute image URL or an empty string.
 */
export function resolveImageUrl(url: string | URL, width?: number): string {
  return resolveImageUrlCommon(url, env.apiUrl, env.appUrl, width);
}

/**
 * Checks if a given URL is an internal URL (relative path).
 * @param url The URL to check.
 * @returns True if the URL is an internal URL, false otherwise.
 */
export function isInternalUrl(url: string | undefined): url is string {
  return !!url && /^\/([^/]|$)/.test(url);
}
