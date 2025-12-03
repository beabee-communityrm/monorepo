import type { Locale } from '@beabee/locale';

import type {
  adminEmailTemplates,
  contactEmailTemplates,
  generalEmailTemplates,
} from '#data/email-templates';
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
  getTemplateEmail(templateId: string): Promise<false | Email | null>;
  getTemplates(): Promise<EmailTemplate[]>;
}

/**
 * Type helper for general email templates
 * Extracts the function types from template definitions
 */
export type GeneralEmailTemplates = {
  [K in keyof typeof generalEmailTemplates]: (typeof generalEmailTemplates)[K]['fn'];
};

/**
 * General email template IDs
 * Derived from generalEmailTemplates
 */
export type GeneralEmailTemplateId = keyof typeof generalEmailTemplates;

/**
 * Type helper for admin email templates
 * Extracts the function types from template definitions
 */
export type AdminEmailTemplates = {
  [K in keyof typeof adminEmailTemplates]: (typeof adminEmailTemplates)[K]['fn'];
};

/**
 * Admin email template IDs
 * Derived from adminEmailTemplates
 */
export type AdminEmailTemplateId = keyof typeof adminEmailTemplates;

/**
 * Type helper for contact email templates
 * Extracts the function types from template definitions
 */
export type ContactEmailTemplates = {
  [K in keyof typeof contactEmailTemplates]: (typeof contactEmailTemplates)[K]['fn'];
};

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
 * Helper type to extract parameters for contact email templates
 */
export type ContactEmailParams<T extends ContactEmailTemplateId> = Parameters<
  ContactEmailTemplates[T]
>[1];

/**
 * Helper type to extract parameters for general email templates
 */
export type GeneralEmailParams<T extends GeneralEmailTemplateId> = Parameters<
  GeneralEmailTemplates[T]
>[0];

/**
 * Helper type to extract parameters for admin email templates
 */
export type AdminEmailParams<T extends AdminEmailTemplateId> = Parameters<
  AdminEmailTemplates[T]
>[0];
