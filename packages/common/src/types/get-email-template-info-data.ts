import { EmailTemplateType } from './email-template-type';

/**
 * Email template metadata for the system templates list view
 */
export interface GetEmailTemplateInfoData {
  id: string;
  type: EmailTemplateType;
  mergeFields: readonly string[];
  /** Whether this template has a custom override */
  hasOverride: boolean;
  /** Whether a default template file exists for this template */
  hasDefaultTemplate: boolean;
  /** The current subject (from override or default template) */
  subject: string;
}
