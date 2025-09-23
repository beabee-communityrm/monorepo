import { isApiError } from '@beabee/client';
import { formatDistanceLocale } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import { i18n } from '../lib/i18n';

/**
 * Extract error code from an API error for use with AppForm component
 * @param error - The error object to extract code from
 * @param statusCodes - Optional array of HTTP status codes to match (defaults to [400, 401])
 * @returns The error code or 'unknown' if not a matching API error
 */
export function extractApiErrorCode(
  error: unknown,
  statusCodes: number[] = [400, 401]
): string {
  return isApiError(error, undefined, statusCodes)
    ? error.code || 'unknown'
    : 'unknown';
}

/**
 * Show a localized rate-limit notification (429) with optional wait seconds
 * Uses notifications.rateLimit.withWait when seconds are available, otherwise .generic
 */
export function notifyRateLimited(error: unknown): void {
  if (!isApiError(error, undefined, [429])) return;
  const seconds = error.retryAfterSeconds;
  const t = i18n.global.t;
  const title = seconds
    ? t('notifications.rateLimit.withWait', {
        time: formatDistanceLocale(
          new Date(Date.now() + seconds * 1000),
          new Date()
        ),
      })
    : t('notifications.rateLimit.generic');
  addNotification({ variant: 'warning', title, removeable: true });
}
