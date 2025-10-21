import type { Email } from '#models/index';

export interface EmailTemplate {
  id: string;
  name: string;
}

export type EmailMergeFields = Record<string, string>;

export interface EmailPerson {
  email: string;
  name?: string;
}

export interface EmailRecipient {
  to: EmailPerson;
  mergeFields?: EmailMergeFields;
}

export interface EmailAttachment {
  type: string;
  name: string;
  content: string;
}

export interface EmailOptions {
  attachments?: EmailAttachment[];
  sendAt?: Date | undefined;
}

export interface TemplateEmailOptions extends EmailOptions {
  customSubject?: string;
}

export interface PreparedEmail extends Email {
  fromEmail: string;
  fromName: string;
}

export interface EmailProvider {
  sendEmail(
    email: Email,
    recipients: EmailRecipient[],
    opts?: EmailOptions
  ): Promise<void>;
  sendTemplate(
    templateId: string,
    recipients: EmailRecipient[],
    opts?: TemplateEmailOptions
  ): Promise<void>;
  getTemplateEmail(templateId: string): Promise<false | Email | null>;
  getTemplates(): Promise<EmailTemplate[]>;
}
