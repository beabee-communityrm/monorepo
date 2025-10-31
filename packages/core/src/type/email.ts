import type {
  adminEmailTemplates,
  contactEmailTemplates,
  generalEmailTemplates,
} from '#data/email-templates';
import type { Contact, Email } from '#models/index';

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

/**
 * Type helper for general email templates
 */
export type GeneralEmailTemplates = typeof generalEmailTemplates;

/**
 * General email template IDs
 * Derived from generalEmailTemplates
 */
export type GeneralEmailTemplateId = keyof typeof generalEmailTemplates;

/**
 * Type helper for admin email templates
 */
export type AdminEmailTemplates = typeof adminEmailTemplates;

/**
 * Admin email template IDs
 * Derived from adminEmailTemplates
 */
export type AdminEmailTemplateId = keyof typeof adminEmailTemplates;

/**
 * Type helper for contact email templates
 */
export type ContactEmailTemplates = typeof contactEmailTemplates;

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
  ContactEmailTemplates[T]['generator']
>[1];

/**
 * Template merge field generation result
 */
export type TemplateMergeFieldResult = Record<string, unknown>;

/**
 * Template function signature for different template types
 */
export type ContactTemplateFunction<T extends ContactEmailTemplateId> = (
  contact: Contact,
  params: ContactEmailParams<T>
) => TemplateMergeFieldResult;

export type AdminTemplateFunction<T extends AdminEmailTemplateId> = (
  params: Parameters<AdminEmailTemplates[T]['generator']>[0]
) => TemplateMergeFieldResult;

export type GeneralTemplateFunction<T extends GeneralEmailTemplateId> = (
  params: Parameters<GeneralEmailTemplates[T]['generator']>[0]
) => TemplateMergeFieldResult;

/**
 * Template parameter extraction result
 */
export type TemplateParameters<T extends EmailTemplateId> =
  T extends ContactEmailTemplateId
    ? ContactEmailParams<T>
    : T extends AdminEmailTemplateId
      ? Parameters<AdminEmailTemplates[T]['generator']>[0]
      : T extends GeneralEmailTemplateId
        ? Parameters<GeneralEmailTemplates[T]['generator']>[0]
        : never;
