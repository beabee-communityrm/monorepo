import type {
  adminEmailTemplates,
  contactEmailTemplates,
  generalEmailTemplates,
} from '#data/email-templates';
import type { Email } from '#models/index';

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

export type EmailTemplate<T extends string, A extends any[]> = {
  mergeFields: readonly T[];
  fn: (...args: A) => { [key in T]: string };
};

export interface PreviewEmailOptions {
  templateId?: EmailTemplateId;
  mergeFields?: Record<string, string>;
  subject?: string;
  body?: string;
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
    opts?: EmailOptions
  ): Promise<void>;
  getTemplateEmail(templateId: string): Promise<Email | null>;
}

/**
 * General email template IDs
 * Derived from generalEmailTemplates
 */
export type GeneralEmailTemplateId = keyof typeof generalEmailTemplates;

/**
 * Admin email template IDs
 * Derived from adminEmailTemplates
 */
export type AdminEmailTemplateId = keyof typeof adminEmailTemplates;

/**
 * Contact email template IDs
 * Derived from contactEmailTemplates
 */
export type ContactEmailTemplateId = keyof typeof contactEmailTemplates;

/**
 * All available email template IDs
 */
export type EmailTemplateId =
  | GeneralEmailTemplateId
  | AdminEmailTemplateId
  | ContactEmailTemplateId;

/**
 * Helper type to extract parameters for general email templates
 */
export type GeneralEmailParams<T extends GeneralEmailTemplateId> = Parameters<
  (typeof generalEmailTemplates)[T]['fn']
>[0];

/**
 * Helper type to extract parameters for contact email templates
 */
export type ContactEmailParams<T extends ContactEmailTemplateId> = Parameters<
  (typeof contactEmailTemplates)[T]['fn']
>[1];

/**
 * Helper type to extract parameters for admin email templates
 */
export type AdminEmailParams<T extends AdminEmailTemplateId> = Parameters<
  (typeof adminEmailTemplates)[T]['fn']
>[0];
