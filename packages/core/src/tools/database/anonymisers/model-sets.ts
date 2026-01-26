import * as models from './models';

export const allAnonymisers = [
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
