import nodemailer, { type Transporter } from 'nodemailer';

import type { SMTPEmailConfig } from '#config/config';
import { log as mainLogger } from '#logging';
import type { EmailOptions, EmailRecipient, PreparedEmail } from '#type/index';

import { BaseProvider } from './BaseProvider.js';

const log = mainLogger.child({ app: 'smtp-email-provider' });

export class SMTPProvider extends BaseProvider {
  private readonly client: Transporter;

  constructor(settings: SMTPEmailConfig['settings']) {
    super();
    this.client = nodemailer.createTransport(settings);
  }

  protected async doSendEmail(
    email: PreparedEmail,
    recipients: EmailRecipient[],
    opts?: EmailOptions
  ): Promise<void> {
    if (opts?.sendAt) {
      log.error("SMTPEmailProvider doesn't support sendAt, ignoring email");
      return;
    }

    log.info('Sending email ' + email.id);

    for (const recipient of recipients) {
      const mergedBody = Object.keys(recipient.mergeFields || {}).reduce(
        (body, field) => {
          return body.replace(
            new RegExp(`\\*\\|${field}\\|\\*`, 'g'),
            '' + recipient.mergeFields![field]
          );
        },
        email.body
      );

      await this.client.sendMail({
        from: {
          name: email.fromName,
          address: email.fromEmail,
        },
        to: recipient.to.name
          ? { name: recipient.to.name, address: recipient.to.email }
          : recipient.to.email,
        subject: email.subject,
        html: mergedBody,
        ...(opts?.attachments && {
          attachments: opts.attachments.map((a) => ({
            filename: a.name,
            contentType: a.type,
            content: a.content,
          })),
        }),
      });
    }
  }
}

/** @deprecated Use named import SMTPProvider instead */
export default SMTPProvider;
