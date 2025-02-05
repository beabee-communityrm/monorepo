import sgMail from "@sendgrid/mail";

import { log as mainLogger } from "#logging";

import type { EmailOptions, EmailRecipient, PreparedEmail } from "#type/index";
import { BaseProvider } from "./BaseProvider";

import { SendGridEmailConfig } from "#config/config";

const log = mainLogger.child({ app: "sendgrid-email-provider" });

export class SendGridProvider extends BaseProvider {
  private readonly testMode: boolean;

  constructor(settings: SendGridEmailConfig["settings"]) {
    super();
    sgMail.setApiKey(settings.apiKey);
    sgMail.setSubstitutionWrappers("*|", "|*");
    this.testMode = settings.testMode;
  }

  protected async doSendEmail(
    email: PreparedEmail,
    recipients: EmailRecipient[],
    opts?: EmailOptions
  ): Promise<void> {
    for (let i = 0; i < recipients.length; i += 1000) {
      const resp = await sgMail.sendMultiple({
        from: {
          email: email.fromEmail,
          name: email.fromName
        },
        subject: email.subject,
        html: email.body,
        personalizations: recipients.slice(i, i + 1000).map((recipient) => ({
          to: recipient.to,
          ...(recipient.mergeFields && {
            substitutions: recipient.mergeFields
          })
        })),
        ...(opts?.sendAt && {
          sendAt: +opts.sendAt
        }),
        ...(opts?.attachments && {
          attachments: opts.attachments.map((attachment) => ({
            filename: attachment.name,
            type: attachment.type,
            content: attachment.content
          }))
        }),
        mailSettings: {
          sandboxMode: {
            enable: this.testMode
          }
        }
      });

      log.info(
        `Sent email to recipients ${i} to ${i + 1000} of ${recipients.length}`,
        { resp }
      );
    }
  }
}
