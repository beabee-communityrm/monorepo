import { EmailTemplateType } from '../data/email-template-type.js';

/**
 * Metadata for a single email template
 * This provides information about available merge fields and template purpose
 */
export interface EmailTemplateMetadata {
  /**
   * Template ID (e.g., 'welcome', 'reset-password', 'cancelled-contribution')
   */
  id: string;

  /**
   * Template type (general, admin, or contact)
   */
  type: EmailTemplateType;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Description of when this template is used
   */
  description: string;

  /**
   * List of merge fields available in this template
   * For contact templates, base fields (EMAIL, NAME, FNAME, LNAME) are automatically included
   */
  mergeFields: string[];
}

/**
 * Response for template metadata endpoint
 */
export interface GetEmailTemplatesMetadataData {
  templates: EmailTemplateMetadata[];
}
