import { isApiError } from '@beabee/client';
import { formatDistanceLocale } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import { i18n } from '../lib/i18n';

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
