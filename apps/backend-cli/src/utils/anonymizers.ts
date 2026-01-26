import * as models from '@beabee/core/tools/database/anonymisers/models';

/**
 * Models that must always be anonymised (contacts and their direct relations)
 * These contain sensitive personal data that should never be exported in plain text
 */
export const ALWAYS_ANONYMIZED_MODELS = [
  models.contactAnonymiser,
  models.contactRoleAnonymiser,
  models.contactProfileAnonymiser,
  models.contactContributionAnonymiser,
  models.contactTagAnonymiser,
  models.contactTagAssignmentAnonymiser,
  models.emailAnonymiser,
  models.emailMailingAnonymiser,
  models.segmentContactsAnonymiser,
  models.segmentOngoingEmailsAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Models that are only anonymised when anonymize=true
 * These contain less sensitive data that can optionally be exported as-is
 */
export const OPTIONALLY_ANONYMIZED_MODELS = [
  models.exportsAnonymiser,
  models.giftFlowAnonymiser,
  models.noticesAnonymiser,
  models.optionsAnonymiser,
  models.paymentsAnonymiser,
  models.pageSettingsAnonymiser,
  models.calloutsAnonymiser,
  models.calloutTagsAnonymiser,
  models.calloutResponsesAnonymiser,
  models.calloutResponseCommentsAnonymiser,
  models.calloutResponseTagsAnonymiser,
  models.calloutVariantAnonymiser,
  models.projectsAnonymiser,
  models.projectContactsAnonymiser,
  models.projectEngagmentsAnonymiser,
  models.referralsGiftAnonymiser,
  models.referralsAnonymiser,
  models.resetSecurityFlowAnonymiser,
  models.segmentsAnonymiser,
  models.exportItemsAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Demo export configuration
 * Defines how many records to include in demo exports
 */
export const DEMO_EXPORT_CONFIG = {
  contacts: 400,
  callouts: 20,
  // Additional limits can be added here
} as const;

/**
 * Get anonymizers based on anonymization level
 */
export const getAnonymizers = (
  anonymize: boolean
): models.ModelAnonymiser[] => {
  return anonymize
    ? [...ALWAYS_ANONYMIZED_MODELS, ...OPTIONALLY_ANONYMIZED_MODELS]
    : ALWAYS_ANONYMIZED_MODELS;
};

/**
 * Get all models for JSON export (needed for complete dumps)
 */
export const getAllModels = (): models.ModelAnonymiser[] => {
  return [...ALWAYS_ANONYMIZED_MODELS, ...OPTIONALLY_ANONYMIZED_MODELS];
};
