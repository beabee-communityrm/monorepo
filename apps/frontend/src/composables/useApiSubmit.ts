import { addNotification } from '@beabee/vue';

import { extractErrorText } from '#utils/api-error';

export interface UseApiSubmitOptions {
  /**
   * Notification title shown on success. Evaluated at success time (not
   * when `useApiSubmit` is called), so it can safely read a reactive `t()`
   * call without going stale if the locale changes later. Omit to skip the
   * success notification entirely.
   */
  successMessage?: () => string;
}

/**
 * @param action The actual save logic (API call + whatever local state it
 * updates on success, e.g. clearing fields or updating a "last saved"
 * snapshot). Errors thrown here are caught and shown as a notification;
 * don't catch them yourself unless you need to react to them separately.
 * @param opts See `UseApiSubmitOptions`.
 */
export function useApiSubmit(
  action: () => Promise<void>,
  opts: UseApiSubmitOptions = {}
) {
  async function submit() {
    try {
      await action();
      if (opts.successMessage) {
        addNotification({ title: opts.successMessage(), variant: 'success' });
      }
    } catch (err) {
      addNotification({
        title: extractErrorText(err),
        variant: 'error',
      });
    }
  }

  return { submit };
}
