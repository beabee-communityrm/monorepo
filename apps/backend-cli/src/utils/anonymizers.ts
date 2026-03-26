import {
  Callout,
  CalloutResponse,
  CalloutResponseComment,
  CalloutResponseSegment,
  CalloutResponseTag,
  CalloutReviewer,
  CalloutTag,
  CalloutVariant,
} from '@beabee/core/models';
import * as models from '@beabee/core/tools/database/anonymisers/models';

import { Chance } from 'chance';
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';

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
  models.segmentsAnonymiser,
  models.segmentContactsAnonymiser,
  models.segmentOngoingEmailsAnonymiser,
  models.paymentsAnonymiser,
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
  models.pageSettingsAnonymiser,
  models.calloutsAnonymiser,
  models.calloutTagsAnonymiser,
  models.calloutResponsesAnonymiser,
  models.calloutResponseCommentsAnonymiser,
  models.calloutResponseTagsAnonymiser,
  models.calloutReviewerAnonymiser,
  models.calloutResponseSegmentsAnonymiser,
  models.signupFlowAnonymiser,
  models.paymentFlowAnonymiser,
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
 * Passthrough anonymisers: same models as OPTIONALLY_ANONYMIZED_MODELS but with
 * empty objectMap so the core exports rows as-is (no anonymisation).
 */
function getOptionalPassthroughAnonymisers(): models.ModelAnonymiser[] {
  return OPTIONALLY_ANONYMIZED_MODELS.map((a) => ({
    model: a.model,
    objectMap: {} as models.ObjectMap<unknown>,
  })) as models.ModelAnonymiser[];
}

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
 * Demo subset: anonymisers for contact-related data (limited contacts)
 */
export const DEMO_CONTACT_ANONYMIZERS = [
  models.contactAnonymiser,
  models.contactRoleAnonymiser,
  models.contactProfileAnonymiser,
  models.paymentsAnonymiser,
  models.contactContributionAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Demo subset: anonymisers for callout-related data (latest callouts)
 */
export const DEMO_CALLOUT_ANONYMIZERS = [
  models.calloutsAnonymiser,
  models.calloutTagsAnonymiser,
  models.calloutVariantAnonymiser,
  models.calloutReviewerAnonymiser,
  models.calloutResponseSegmentsAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Demo subset: anonymisers for callout response data
 */
export const DEMO_CALLOUT_RESPONSE_ANONYMIZERS = [
  models.calloutResponsesAnonymiser,
  models.calloutResponseTagsAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Models cleared in demo export but not repopulated (link tables / dependent data)
 */
export const DEMO_CLEAR_ONLY_ANONYMIZERS = [
  models.calloutResponseCommentsAnonymiser,
  models.projectContactsAnonymiser,
  models.projectEngagementsAnonymiser,
  models.segmentContactsAnonymiser,
  models.referralsAnonymiser,
  models.resetSecurityFlowAnonymiser,
  models.signupFlowAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Context for demo export: IDs of the subset to export
 */
export interface DemoExportContext {
  contactIds: string[];
  calloutIds: string[];
  responseIds: string[];
}

/**
 * All anonymisers used in demo export, in dependency order
 */
export const getDemoAnonymisers = (): models.ModelAnonymiser[] => [
  ...DEMO_CONTACT_ANONYMIZERS,
  ...DEMO_CALLOUT_ANONYMIZERS,
  ...DEMO_CALLOUT_RESPONSE_ANONYMIZERS,
];

/**
 * All models to clear for demo export (anonymised + clear-only)
 */
export const getDemoClearModels = (): models.ModelAnonymiser[] => [
  ...getDemoAnonymisers(),
  ...DEMO_CLEAR_ONLY_ANONYMIZERS,
];

/**
 * Returns the query filter for a demo anonymiser so only the demo subset is exported
 */
export function getDemoPrepareQuery(
  anonymiser: models.ModelAnonymiser,
  context: DemoExportContext
): (
  qb: SelectQueryBuilder<ObjectLiteral>
) => SelectQueryBuilder<ObjectLiteral> {
  if (
    DEMO_CONTACT_ANONYMIZERS.includes(
      anonymiser as (typeof DEMO_CONTACT_ANONYMIZERS)[number]
    )
  ) {
    const pk = anonymiser === models.contactAnonymiser ? 'id' : 'contactId';
    return (qb) =>
      qb.where(`item.${pk} IN (:...contacts)`, {
        contacts: context.contactIds,
      });
  }
  if (
    DEMO_CALLOUT_ANONYMIZERS.includes(
      anonymiser as (typeof DEMO_CALLOUT_ANONYMIZERS)[number]
    )
  ) {
    const pk = anonymiser === models.calloutsAnonymiser ? 'id' : 'calloutId';
    return (qb) =>
      qb.where(`item.${pk} IN (:...ids)`, { ids: context.calloutIds });
  }
  if (
    DEMO_CALLOUT_RESPONSE_ANONYMIZERS.includes(
      anonymiser as (typeof DEMO_CALLOUT_RESPONSE_ANONYMIZERS)[number]
    )
  ) {
    const pk =
      anonymiser === models.calloutResponsesAnonymiser ? 'id' : 'responseId';
    return (qb) =>
      qb.where(`item.${pk} IN (:...responses)`, {
        responses: context.responseIds,
      });
  }
  return (qb) => qb;
}

// --- Callout export anonymizers ---

const calloutExportChance = new Chance();

/**
 * Callout response anonymiser for callout export: keeps answers intact,
 * NULLs contact FKs, anonymises guest personal data.
 * This is intentionally a different object than calloutResponsesAnonymiser
 * so anonymiseModel() uses the normal code path (no per-callout answer anonymisation).
 */
const calloutResponseCalloutExportAnonymiser: models.ModelAnonymiser = {
  model: CalloutResponse,
  objectMap: {
    contactId: () => null,
    assigneeId: () => null,
    guestName: () => calloutExportChance.name(),
    guestEmail: () =>
      calloutExportChance.email({ domain: 'example.com', length: 10 }),
  } as models.ObjectMap<unknown>,
};

/** Callout export: tables to insert with anonymisation (personal data only) */
export const CALLOUT_EXPORT_ANONYMIZERS: models.ModelAnonymiser[] = [
  { model: Callout, objectMap: {} as models.ObjectMap<unknown> },
  calloutResponseCalloutExportAnonymiser,
];

/** Callout export: full anonymisation including per-component answer anonymisation */
export const CALLOUT_EXPORT_FULL_ANONYMIZERS: models.ModelAnonymiser[] = [
  { model: Callout, objectMap: {} as models.ObjectMap<unknown> },
  models.calloutResponsesAnonymiser,
] as models.ModelAnonymiser[];

/** Callout export: tables to insert without any anonymisation */
export const CALLOUT_EXPORT_PASSTHROUGH_ANONYMIZERS: models.ModelAnonymiser[] =
  [
    { model: Callout, objectMap: {} as models.ObjectMap<unknown> },
    { model: CalloutResponse, objectMap: {} as models.ObjectMap<unknown> },
  ];

/** Callout export: all tables to clear (FK dependencies), in insert order.
 *  clearModels() reverses this to delete children before parents. */
export const CALLOUT_EXPORT_CLEAR_MODELS: models.ModelAnonymiser[] = [
  { model: Callout, objectMap: {} as models.ObjectMap<unknown> },
  { model: CalloutTag, objectMap: {} as models.ObjectMap<unknown> },
  { model: CalloutVariant, objectMap: {} as models.ObjectMap<unknown> },
  { model: CalloutReviewer, objectMap: {} as models.ObjectMap<unknown> },
  { model: CalloutResponseSegment, objectMap: {} as models.ObjectMap<unknown> },
  { model: CalloutResponse, objectMap: {} as models.ObjectMap<unknown> },
  { model: CalloutResponseTag, objectMap: {} as models.ObjectMap<unknown> },
  {
    model: CalloutResponseComment,
    objectMap: {} as models.ObjectMap<unknown>,
  },
];

/**
 * Get anonymizers based on anonymization level
 */
export const getAnonymizers = (
  anonymize: boolean,
  skipAnonymizeTables: string[] = [],
  preserveCalloutAnswers = false
): models.ModelAnonymiser[] => {
  let fullList = anonymize
    ? [...ALWAYS_ANONYMIZED_MODELS, ...OPTIONALLY_ANONYMIZED_MODELS]
    : [...ALWAYS_ANONYMIZED_MODELS, ...getOptionalPassthroughAnonymisers()];

  // When anonymize=true but answers should be preserved, swap in the callout-export
  // anonymiser that NULLs FKs/guest data but keeps answers intact (avoids the
  // per-component answer anonymisation triggered by the calloutResponsesAnonymiser identity check).
  if (preserveCalloutAnswers && anonymize) {
    fullList = fullList.map((a) =>
      a === models.calloutResponsesAnonymiser
        ? calloutResponseCalloutExportAnonymiser
        : a
    );
  }

  if (skipAnonymizeTables.length === 0) return fullList;

  const skipSet = new Set(skipAnonymizeTables.map((t) => t.toLowerCase()));

  return fullList.map((a) => {
    const entityName =
      typeof a.model === 'function' ? a.model.name : String(a.model);
    if (skipSet.has(entityName.toLowerCase())) {
      return { model: a.model, objectMap: {} as models.ObjectMap<unknown> };
    }
    return a;
  }) as models.ModelAnonymiser[];
};
