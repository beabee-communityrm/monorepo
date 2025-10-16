import { runApp } from '@beabee/core/server';
import {
  anonymiseModel,
  clearModels,
  initializeJsonDump,
  saveJsonDump,
} from '@beabee/core/tools/database/anonymisers/index';
import * as models from '@beabee/core/tools/database/anonymisers/models';

/**
 * Models that must always be anonymised (contacts and their direct relations)
 */
const alwaysAnonymisedModels = [
  models.contactAnonymiser,
  models.contactRoleAnonymiser,
  models.contactProfileAnonymiser,
  models.contactContributionAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Models that are only anonymised when anonymize=true
 */
const optionallyAnonymisedModels = [
  models.contactTagAnonymiser,
  models.contactTagAssignmentAnonymiser,
  models.emailAnonymiser,
  models.emailMailingAnonymiser,
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
  models.segmentContactsAnonymiser,
  models.segmentOngoingEmailsAnonymiser,
  models.exportItemsAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Export database to JSON or SQL dump with optional anonymisation
 *
 * @param dryRun If true, only logs what would be done
 * @param type Export type: json or sql
 * @param anonymize If true, anonymize all data. If false, only anonymize contacts. Default: true
 */
export const exportDatabase = async (
  dryRun = false,
  type: 'json' | 'sql' = 'json',
  anonymize = true
): Promise<void> => {
  await runApp(async () => {
    const valueMap = new Map<string, unknown>();

    // Always include contact anonymisers to ensure contact data is always anonymised
    const anonymisers = anonymize
      ? [...alwaysAnonymisedModels, ...optionallyAnonymisedModels]
      : alwaysAnonymisedModels;

    if (type === 'json') {
      // For JSON, we need all models (even non-anonymised ones) to be in the dump
      const allModels = [
        ...alwaysAnonymisedModels,
        ...optionallyAnonymisedModels,
      ];
      initializeJsonDump(allModels);
    } else {
      clearModels(anonymisers);
    }

    // Process anonymised models
    for (const anonymiser of anonymisers) {
      await anonymiseModel(anonymiser, (qb) => qb, valueMap, type);
    }

    // If not anonymizing everything and using JSON, we need to export the remaining models as-is
    if (!anonymize && type === 'json') {
      // TODO: Export non-anonymised models directly
      // This would require a separate function to export models without anonymisation
      console.warn('Non-anonymised JSON export is not fully implemented yet');
    }

    if (type === 'json') {
      saveJsonDump(dryRun);
    }
  });
};
