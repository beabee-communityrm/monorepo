import { runApp } from '@beabee/core/server';
import {
  anonymiseModel,
  initializeJsonDump,
  saveJsonDump,
} from '@beabee/core/tools/database/anonymisers/index';
import * as models from '@beabee/core/tools/database/anonymisers/models';

const anonymisers = [
  models.contactAnonymiser, // A lot of relations depend on contacts so leave it first
  models.contactTagAnonymiser, // Tags must be created before assignments
  models.contactRoleAnonymiser, // Roles can be created after contacts
  models.contactTagAssignmentAnonymiser, // Must be after both contacts and tags
  models.contactProfileAnonymiser,
  models.emailAnonymiser,
  models.emailMailingAnonymiser,
  models.exportsAnonymiser,
  models.giftFlowAnonymiser,
  models.noticesAnonymiser,
  models.optionsAnonymiser,
  models.contactContributionAnonymiser,
  models.paymentsAnonymiser,
  models.pageSettingsAnonymiser,
  models.calloutsAnonymiser,
  models.calloutTagsAnonymiser, // Must be before calloutResponseTagsAnonymiser
  models.calloutResponsesAnonymiser, // Before Comments and Tags
  models.calloutResponseCommentsAnonymiser,
  models.calloutResponseTagsAnonymiser,
  models.calloutVariantAnonymiser,
  models.projectsAnonymiser,
  models.projectContactsAnonymiser,
  models.projectEngagmentsAnonymiser,
  models.referralsGiftAnonymiser, // Must be before referralsAnonymiser
  models.referralsAnonymiser,
  models.resetSecurityFlowAnonymiser,
  models.segmentsAnonymiser,
  models.segmentContactsAnonymiser,
  models.segmentOngoingEmailsAnonymiser,
  models.exportItemsAnonymiser, // Must be after all exportable items
] as models.ModelAnonymiser[];

/**
 * Runs the backend anonymiser script inside the API app container context.
 *
 * @param dryRun If true, only logs what would be done (not used here, for API consistency)
 */
export const runAnonymisers = async (
  dryRun = false,
  type = 'json'
): Promise<void> => {
  await runApp(async () => {
    const valueMap = new Map<string, unknown>();

    // Initialize the JSON dump structure
    initializeJsonDump(anonymisers);

    for (const anonymiser of anonymisers) {
      await anonymiseModel(anonymiser, (qb) => qb, valueMap, (type = 'json'));
    }

    // Save the completed JSON dump to file
    saveJsonDump(dryRun);
  });
};
