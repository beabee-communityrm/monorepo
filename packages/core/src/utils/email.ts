import {
  adminEmailTemplates,
  contactEmailTemplates,
  generalEmailTemplates,
} from '#data/email-templates';
import type {
  AdminEmailTemplateId,
  ContactEmailTemplateId,
  EmailTemplateId,
  GeneralEmailTemplateId,
} from '#type/email';

/**
 * Type guard to check if a string is a valid contact email template ID
 * @param templateId The template ID to check
 * @returns True if the template ID is a valid contact email template
 */
export function isContactEmailTemplateId(
  templateId: string
): templateId is ContactEmailTemplateId {
  return templateId in contactEmailTemplates;
}

/**
 * Type guard to check if a string is a valid admin email template ID
 * @param templateId The template ID to check
 * @returns True if the template ID is a valid admin email template
 */
export function isAdminEmailTemplateId(
  templateId: string
): templateId is AdminEmailTemplateId {
  return templateId in adminEmailTemplates;
}

/**
 * Type guard to check if a string is a valid general email template ID
 * @param templateId The template ID to check
 * @returns True if the template ID is a valid general email template
 */
export function isGeneralEmailTemplateId(
  templateId: string
): templateId is GeneralEmailTemplateId {
  return templateId in generalEmailTemplates;
}

/**
 * Type guard to check if a string is a valid email template ID
 * @param templateId The template ID to check
 * @returns True if the template ID is a valid email template
 */
export function isEmailTemplateId(
  templateId: string
): templateId is EmailTemplateId {
  return (
    isContactEmailTemplateId(templateId) ||
    isAdminEmailTemplateId(templateId) ||
    isGeneralEmailTemplateId(templateId)
  );
}

/**
 * Standard mapping from merge field names to parameter names for common templates
 * This provides a clean, maintainable way to map merge fields to the expected parameter names
 */
const TEMPLATE_PARAM_MAPPINGS: Record<string, Record<string, string>> = {
  'callout-response-answers': {
    MESSAGE: 'message',
    CALLOUTSLUG: 'calloutSlug',
    CALLOUTTITLE: 'calloutTitle',
    ANSWERS: 'answers',
  },
  'reset-password': {
    RPLINK: 'rpLink',
  },
  'reset-device': {
    RPLINK: 'rpLink',
  },
  'successful-referral': {
    REFEREENAME: 'refereeName',
    ISELIGIBLE: 'isEligible',
  },
  'giftee-success': {
    FROMNAME: 'fromName',
    MESSAGE: 'message',
    GIFTCODE: 'giftCode',
  },
  'email-exists-login': {
    LOGINLINK: 'loginLink',
  },
  'email-exists-set-password': {
    SPLINK: 'spLink',
  },
  'new-callout-response': {
    CALLOUTSLUG: 'calloutSlug',
    CALLOUTTITLE: 'calloutTitle',
    RESPNAME: 'responderName',
  },
  'purchased-gift': {
    FROMNAME: 'fromName',
    GIFTEEFIRSTNAME: 'gifteeFirstName',
    GIFTSTARTDATE: 'giftStartDate',
  },
  'confirm-email': {
    FIRSTNAME: 'firstName',
    LASTNAME: 'lastName',
    CONFIRMLINK: 'confirmLink',
  },
  'expired-special-url-resend': {
    FIRSTNAME: 'firstName',
    NEWURL: 'newUrl',
  },
};

/**
 * Extracts template parameters from custom merge fields using predefined mappings
 * @param templateId The template ID
 * @param customMergeFields The custom merge fields from the request
 * @returns Template parameters object
 */
export function extractTemplateParams(
  templateId: string,
  customMergeFields: Record<string, string>
): Record<string, any> {
  const mapping = TEMPLATE_PARAM_MAPPINGS[templateId];

  if (!mapping) {
    return {};
  }

  const params: Record<string, any> = {};

  for (const [mergeField, paramName] of Object.entries(mapping)) {
    if (customMergeFields[mergeField] !== undefined) {
      params[paramName] = customMergeFields[mergeField];
    }
  }

  return params;
}
