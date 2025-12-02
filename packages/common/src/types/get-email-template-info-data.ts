/**
 * Email template metadata for the system templates list view
 */
export interface GetEmailTemplateInfoData {
  id: string;
  type: 'general' | 'admin' | 'contact';
  mergeFields: string[];
  /** Whether this template has a custom override */
  hasOverride: boolean;
  /** Whether a default template file exists for this template */
  hasDefaultTemplate: boolean;
  /** The current subject (from override or default template) */
  subject: string;
}
