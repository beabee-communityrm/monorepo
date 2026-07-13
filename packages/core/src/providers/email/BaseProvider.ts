import { ApiHealthStatus } from '@beabee/beabee-common';

import config from '#config/config';
import { getRepository } from '#database';
import { Email } from '#models/index';
import OptionsService from '#services/OptionsService';
import { formatEmailBody } from '#templates/email';
import type {
  EmailOptions,
  EmailProvider,
  EmailRecipient,
  PreparedEmail,
} from '#type/index';

const magicMergeFields = ['SPLINK', 'LOGINLINK', 'RPLINK'] as const;

// Credentials are managed by the identity provider, so the legacy set/reset
// password merge fields simply link to the login page like LOGINLINK
function fillWithLoginLink(mergeField: (typeof magicMergeFields)[number]) {
  return async (recipients: EmailRecipient[]): Promise<EmailRecipient[]> =>
    recipients.map((recipient) =>
      recipient.mergeFields?.[mergeField]
        ? recipient
        : {
            ...recipient,
            mergeFields: {
              ...recipient.mergeFields,
              [mergeField]: `${config.audience}/auth/login`,
            },
          }
    );
}

const magicMergeFieldsProcessors = {
  SPLINK: fillWithLoginLink('SPLINK'),
  RPLINK: fillWithLoginLink('RPLINK'),
  LOGINLINK: fillWithLoginLink('LOGINLINK'),
} as const;

export abstract class BaseProvider implements EmailProvider {
  protected abstract doSendEmail(
    email: PreparedEmail,
    recipients: EmailRecipient[],
    opts?: EmailOptions | undefined
  ): Promise<void>;

  async sendEmail(
    email: Email,
    recipients: EmailRecipient[],
    opts?: EmailOptions | undefined
  ): Promise<void> {
    const preparedEmail = {
      ...email,
      body: formatEmailBody(email.body),
      fromEmail: email.fromEmail || OptionsService.getText('support-email'),
      fromName:
        email.fromName ||
        (email.fromEmail ? '' : OptionsService.getText('support-email-from')),
    };

    // Process magic merge fields (e.g., SPLINK, RPLINK, LOGINLINK)
    let preparedRecipients = recipients;
    for (const mergeField of magicMergeFields) {
      if (email.body.includes(`*|${mergeField}|*`)) {
        preparedRecipients =
          await magicMergeFieldsProcessors[mergeField](preparedRecipients);
      }
    }

    await this.doSendEmail(preparedEmail, preparedRecipients, opts);
  }

  async sendTemplate(
    templateId: string,
    recipients: EmailRecipient[],
    opts?: EmailOptions
  ): Promise<void> {
    const email = await getRepository(Email).findOneBy({ id: templateId });
    if (email) {
      await this.sendEmail(email, recipients, opts);
    }
  }

  async getTemplateEmail(templateId: string): Promise<Email | null> {
    return await getRepository(Email).findOneBy({ id: templateId });
  }

  /**
   * Check the health of the email integration.
   * @returns HEALTHY if the provider is reachable, UNHEALTHY otherwise
   */
  abstract getHealthStatus(): Promise<ApiHealthStatus>;
}

/** @deprecated Use named import BaseProvider instead */
export default BaseProvider;
