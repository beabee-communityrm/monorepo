import * as models from '@beabee/core/tools/database/anonymisers/models';

import type { AnonymizationLevel } from '../types/index.js';

const ALL_ANONYMISERS = [
  models.contactAnonymiser,
  models.contactRoleAnonymiser,
  models.contactProfileAnonymiser,
  models.contactContributionAnonymiser,
  models.contactTagAnonymiser,
  models.contactTagAssignmentAnonymiser,
  models.emailAnonymiser,
  models.emailMailingAnonymiser,
  models.segmentsAnonymiser,
  models.segmentContactsAnonymiser,
  models.segmentOngoingEmailsAnonymiser,
  models.paymentsAnonymiser,
  models.apiKeyAnonymiser,
  models.exportsAnonymiser,
  models.giftFlowAnonymiser,
  models.noticesAnonymiser,
  models.optionsAnonymiser,
  models.contentAnonymiser,
  models.pageSettingsAnonymiser,
  models.calloutsAnonymiser,
  models.calloutTagsAnonymiser,
  models.calloutResponsesAnonymiser,
  models.calloutResponseCommentsAnonymiser,
  models.calloutResponseTagsAnonymiser,
  models.calloutReviewerAnonymiser,
  models.calloutResponseSegmentsAnonymiser,
  models.paymentFlowAnonymiser,
  models.signupFlowAnonymiser,
  models.calloutVariantAnonymiser,
  models.projectsAnonymiser,
  models.projectContactsAnonymiser,
  models.projectEngagementsAnonymiser,
  models.referralsGiftAnonymiser,
  models.referralsAnonymiser,
  models.resetSecurityFlowAnonymiser,
  models.exportItemsAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Anonymizers for the given level.
 *
 * - `full`: all models anonymised (default)
 * - `safe`: contacts/payments/emails/segments anonymised, other tables passthrough
 * - `test`: email/content/options passthrough, other tables anonymized
 * - `none`: everything passthrough (raw rows, including PII)
 */
const anonymisationLevelSkipList = {
  full: [],
  test: [
    models.contentAnonymiser,
    models.optionsAnonymiser,
    models.emailAnonymiser,
  ],
  safe: [
    models.apiKeyAnonymiser,
    models.exportsAnonymiser,
    models.giftFlowAnonymiser,
    models.noticesAnonymiser,
    models.optionsAnonymiser,
    models.contentAnonymiser,
    models.pageSettingsAnonymiser,
    models.calloutsAnonymiser,
    models.calloutTagsAnonymiser,
    models.calloutResponsesAnonymiser,
    models.calloutResponseCommentsAnonymiser,
    models.calloutResponseTagsAnonymiser,
    models.calloutReviewerAnonymiser,
    models.calloutVariantAnonymiser,
    models.calloutResponseSegmentsAnonymiser,
    models.paymentFlowAnonymiser,
    models.signupFlowAnonymiser,
    models.projectsAnonymiser,
    models.projectContactsAnonymiser,
    models.projectEngagementsAnonymiser,
    models.referralsGiftAnonymiser,
    models.referralsAnonymiser,
    models.resetSecurityFlowAnonymiser,
    models.exportItemsAnonymiser,
  ],
  none: ALL_ANONYMISERS,
} as const;

export const getAnonymizers = (
  level: AnonymizationLevel,
  skipAnonymizeTables: string[] = [],
  availableAnonymisers = ALL_ANONYMISERS
): models.ModelAnonymiser[] => {
  const anonymiserSkipList = [
    ...skipAnonymizeTables
      .map((name) => availableAnonymisers.find((a) => a.name === name))
      .filter((a) => !!a),
    ...anonymisationLevelSkipList[level],
  ];

  return availableAnonymisers.map((anonymiser) => {
    if (anonymiserSkipList.includes(anonymiser)) {
      return {
        ...anonymiser,
        map: {} as models.AnonymisationMap<unknown>, // TODO: change to copy
      };
    } else {
      return anonymiser;
    }
  });
};
