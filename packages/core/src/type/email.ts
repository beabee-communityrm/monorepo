import type { Email } from '#models/index';
import type { emailTemplateService } from '#services/EmailTemplateService';

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
 * Email template types categorizing different email purposes
 */
export type EmailTemplateType = 'general' | 'admin' | 'contact';

/**
 * Type helper for general email templates
 */
export type GeneralEmailTemplates =
  (typeof emailTemplateService)['generalEmailTemplates'];

/**
 * General email template IDs
 * Derived from generalEmailTemplates
 */
export type GeneralEmailTemplateId = Extract<
  keyof (typeof emailTemplateService)['generalEmailTemplates'],
  string
>;

/**
 * Type helper for admin email templates
 */
export type AdminEmailTemplates =
  (typeof emailTemplateService)['adminEmailTemplates'];

/**
 * Admin email template IDs
 * Derived from adminEmailTemplates
 */
export type AdminEmailTemplateId = Extract<
  keyof (typeof emailTemplateService)['adminEmailTemplates'],
  string
>;

/**
 * Type helper for contact email templates
 */
export type ContactEmailTemplates =
  (typeof emailTemplateService)['contactEmailTemplates'];

/**
 * Contact email template IDs
 * Derived from contactEmailTemplates
 */
export type ContactEmailTemplateId = Extract<
  keyof (typeof emailTemplateService)['contactEmailTemplates'],
  string
>;

/**
 * All available email template IDs
 */
export type EmailTemplateId =
  | GeneralEmailTemplateId
  | AdminEmailTemplateId
  | ContactEmailTemplateId;

/**
 * Extract parameters from a function type
 * For contact templates: extracts the second parameter (params) if it exists
 * For admin/general templates: extracts the first parameter (params)
 */
type ExtractTemplateParams<
  T extends EmailTemplateId,
  Type extends EmailTemplateType,
> = Type extends 'contact'
  ? T extends ContactEmailTemplateId
    ? // Check if function has 2 parameters by checking if second param exists
      Parameters<ContactEmailTemplates[T]>['length'] extends 2
      ? Parameters<ContactEmailTemplates[T]>[1]
      : undefined
    : never
  : Type extends 'admin'
    ? T extends AdminEmailTemplateId
      ? Parameters<AdminEmailTemplates[T]>[0]
      : never
    : Type extends 'general'
      ? T extends GeneralEmailTemplateId
        ? Parameters<GeneralEmailTemplates[T]>[0]
        : never
      : never;

/**
 * Generic helper type to extract parameters for email templates
 * Works for all template types (contact, admin, general)
 */
export type EmailTemplateParams<
  T extends EmailTemplateId,
  Type extends EmailTemplateType,
> = ExtractTemplateParams<T, Type>;

/**
 * Helper type to extract parameters for contact email templates
 * Returns undefined if the template doesn't require parameters
 */
export type ContactEmailParams<T extends ContactEmailTemplateId> =
  ExtractTemplateParams<T, 'contact'>;

/**
 * Helper type to extract parameters for admin email templates
 */
export type AdminEmailParams<T extends AdminEmailTemplateId> =
  ExtractTemplateParams<T, 'admin'>;

/**
 * Helper type to extract parameters for general email templates
 */
export type GeneralEmailParams<T extends GeneralEmailTemplateId> =
  ExtractTemplateParams<T, 'general'>;
