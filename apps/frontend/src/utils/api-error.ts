import {
  ApiError,
  NotFoundError,
  PaymentFailedError,
  TooManyRequestsError,
} from '@beabee/client';
import { formatDistanceLocale } from '@beabee/vue';
import { addNotification } from '@beabee/vue/store/notifications';

import { computed } from 'vue';
import { type Router } from 'vue-router';

import { i18n } from '../lib/i18n';

const t = i18n.global.t;

const defaultErrorMessages = computed<Record<string, string>>(() => ({
  unknown: t('form.errorMessages.generic'),
  'account-locked': t('form.errorMessages.api.account-locked'),
  'cant-update-contribution': t(
    'form.errorMessages.api.cant-update-contribution'
  ),
  'duplicate-email': t('form.errorMessages.api.duplicate-email'),
  'duplicate-tag-name': t('form.errorMessages.api.duplicate-tag-name'),
  'invalid-token': t('form.errorMessages.api.invalid-token'),
  'login-failed': t('form.errorMessages.api.login-failed'),
  'mfa-token-required': t('form.errorMessages.api.mfa-token-required'),
  'payment-failed': t('form.errorMessages.api.payment-failed'),
}));
/**
 * Extract a nice error text from an API error
 *
 * @param error The error object to extract code from
 * @param errorMessages Optional custom error messages to override defaults
 * @returns The translated error message for known errors or a generic one for
 * unknown errors
 */
export function extractErrorText(
  error: unknown,
  errorMessages?: Record<string, string>
): string {
  const code = error instanceof ApiError ? error.code : 'unknown';

  return (
    errorMessages?.[code] ||
    defaultErrorMessages.value[code] ||
    defaultErrorMessages.value.unknown
  );
}

/**
 * Show a localized rate-limit notification (429) with optional wait seconds
 * Uses notifications.rateLimit.withWait when seconds are available, otherwise .generic
 */
export function notifyRateLimited(error: TooManyRequestsError): void {
  const title = error.retryAfter
    ? t('notifications.rateLimit.withWait', {
        time: formatDistanceLocale(
          new Date(Date.now() + error.retryAfter * 1000),
          new Date()
        ),
      })
    : t('notifications.rateLimit.generic');
  addNotification({ variant: 'warning', title, removeable: true });
}

export function handleJoinError(err: unknown, router: Router): void {
  if (err instanceof PaymentFailedError) {
    router.replace('/join/payment-failed');
  } else if (err instanceof NotFoundError) {
    router.replace('/join/not-found');
  } else {
    if (err instanceof TooManyRequestsError) {
      notifyRateLimited(err);
    }

    router.replace('/join/failed');
  }
}
