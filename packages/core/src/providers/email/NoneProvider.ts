import { ApiHealthStatus } from '@beabee/beabee-common';

import { log as mainLogger } from '#logging';
import type { EmailOptions, EmailRecipient, PreparedEmail } from '#type/index';

import { BaseProvider } from './BaseProvider.js';

const log = mainLogger.child({ app: 'none-email-provider' });

/**
 * Empty email provider used when email sending is disabled
 * (BEABEE_EMAIL_PROVIDER=none). Emails are silently dropped.
 */
export class NoneProvider extends BaseProvider {
  protected async doSendEmail(
    email: PreparedEmail,
    recipients: EmailRecipient[],
    opts?: EmailOptions
  ): Promise<void> {
    log.warning(
      `Email provider is disabled, dropping email "${email.subject}"`
    );
  }

  async getHealthStatus(): Promise<ApiHealthStatus> {
    return ApiHealthStatus.DISABLED;
  }
}

/** @deprecated Use named import NoneProvider instead */
export default NoneProvider;
