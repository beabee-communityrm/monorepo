import type { Email } from "@beabee/models";
import type { LocaleObject } from "@beabee/locales";
import type { EmailRecipient, EmailOptions, EmailTemplate } from "./index.js";

export interface EmailProvider {
  sendEmail(
    email: Email,
    recipients: EmailRecipient[],
    locale: LocaleObject,
    opts?: EmailOptions
  ): Promise<void>;
  sendTemplate(
    templateId: string,
    recipients: EmailRecipient[],
    locale: LocaleObject,
    opts?: EmailOptions
  ): Promise<void>;
  getTemplateEmail(templateId: string): Promise<false | Email | null>;
  getTemplates(): Promise<EmailTemplate[]>;
}
