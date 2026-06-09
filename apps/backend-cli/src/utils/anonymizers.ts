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

import type { AnonymizationLevel } from '../types/index.js';

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
function getOptionallyAnonymizedModels(
  preserveCalloutAnswers = false
): models.ModelAnonymiser[] {
  return [
    models.apiKeyAnonymiser,
    models.exportsAnonymiser,
    models.giftFlowAnonymiser,
    models.noticesAnonymiser,
    models.optionsAnonymiser,
    models.contentAnonymiser,
    models.pageSettingsAnonymiser,
    models.calloutsAnonymiser,
    models.calloutTagsAnonymiser,
    preserveCalloutAnswers
      ? calloutResponseCalloutExportAnonymiser
      : models.calloutResponsesAnonymiser,
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
}

/**
 * Passthrough anonymisers: same models as OPTIONALLY_ANONYMIZED_MODELS but with
 * empty map so the core exports rows as-is (no anonymisation).
 */
function getOptionalPassthroughAnonymisers(): models.ModelAnonymiser[] {
  return getOptionallyAnonymizedModels(false).map((a) => ({
    model: a.model,
    map: {} as models.AnonymisationMap<unknown>,
  })) as models.ModelAnonymiser[];
}

/**
 * Passthrough anonymisers for ALWAYS_ANONYMIZED_MODELS (level='none' only).
 * Exports contacts/payments/emails/segments as raw rows — for local migration testing.
 */
function getAlwaysPassthroughAnonymisers(): models.ModelAnonymiser[] {
  return ALWAYS_ANONYMIZED_MODELS.map((a) => ({
    model: a.model,
    map: {} as models.AnonymisationMap<unknown>,
  })) as models.ModelAnonymiser[];
}

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
  map: {
    contactId: () => null,
    assigneeId: () => null,
    guestName: () => calloutExportChance.name(),
    guestEmail: () =>
      calloutExportChance.email({ domain: 'example.com', length: 10 }),
  } as models.AnonymisationMap<unknown>,
};

/** Callout export: tables to insert with anonymisation (personal data only).
 *  CalloutVariant and CalloutTag are passthrough (no personal data).
 *  CalloutReviewer is excluded (non-nullable contactId FK). */
export const CALLOUT_EXPORT_ANONYMIZERS: models.ModelAnonymiser[] = [
  { model: Callout, map: {} as models.AnonymisationMap<unknown> },
  { model: CalloutVariant, map: {} as models.AnonymisationMap<unknown> },
  { model: CalloutTag, map: {} as models.AnonymisationMap<unknown> },
  calloutResponseCalloutExportAnonymiser,
];

/** Callout export: full anonymisation including per-component answer anonymisation */
export const CALLOUT_EXPORT_FULL_ANONYMIZERS: models.ModelAnonymiser[] = [
  { model: Callout, map: {} as models.AnonymisationMap<unknown> },
  { model: CalloutVariant, map: {} as models.AnonymisationMap<unknown> },
  { model: CalloutTag, map: {} as models.AnonymisationMap<unknown> },
  models.calloutResponsesAnonymiser,
] as models.ModelAnonymiser[];

/** Callout export: tables to insert without any anonymisation */
export const CALLOUT_EXPORT_PASSTHROUGH_ANONYMIZERS: models.ModelAnonymiser[] =
  [
    { model: Callout, map: {} as models.AnonymisationMap<unknown> },
    {
      model: CalloutVariant,
      map: {} as models.AnonymisationMap<unknown>,
    },
    { model: CalloutTag, map: {} as models.AnonymisationMap<unknown> },
    {
      model: CalloutResponse,
      map: {} as models.AnonymisationMap<unknown>,
    },
  ];

/** Callout export: all tables to clear (FK dependencies), in insert order.
 *  clearModels() reverses this to delete children before parents. */
export const CALLOUT_EXPORT_CLEAR_MODELS: models.ModelAnonymiser[] = [
  { model: Callout, map: {} as models.AnonymisationMap<unknown> },
  { model: CalloutTag, map: {} as models.AnonymisationMap<unknown> },
  { model: CalloutVariant, map: {} as models.AnonymisationMap<unknown> },
  { model: CalloutReviewer, map: {} as models.AnonymisationMap<unknown> },
  {
    model: CalloutResponseSegment,
    map: {} as models.AnonymisationMap<unknown>,
  },
  { model: CalloutResponse, map: {} as models.AnonymisationMap<unknown> },
  {
    model: CalloutResponseTag,
    map: {} as models.AnonymisationMap<unknown>,
  },
  {
    model: CalloutResponseComment,
    map: {} as models.AnonymisationMap<unknown>,
  },
];

/**
 * Get anonymizers for the given level.
 *
 * - `full`: all models anonymised (default)
 * - `safe`: contacts/payments/emails/segments anonymised, other tables passthrough
 * - `test`: email/content/options excluded, other tables anonymized
 * - `none`: everything passthrough (raw rows, including PII)
 */
// TODO: Use level as a proxy for skip, then everything will be nicer
export const getAnonymizers = (
  level: AnonymizationLevel,
  skipAnonymizeTables: string[] = [],
  preserveCalloutAnswers = false
): models.ModelAnonymiser[] => {
  let fullList: models.ModelAnonymiser[];
  switch (level) {
    case 'full':
      fullList = [
        ...ALWAYS_ANONYMIZED_MODELS,
        ...getOptionallyAnonymizedModels(preserveCalloutAnswers),
      ];
      break;
    case 'safe':
      fullList = [
        ...ALWAYS_ANONYMIZED_MODELS,
        ...getOptionalPassthroughAnonymisers(),
      ];
      break;
    case 'test':
      fullList = [
        ...ALWAYS_ANONYMIZED_MODELS,
        ...getOptionallyAnonymizedModels(preserveCalloutAnswers),
      ].filter(
        (anonymiser) =>
          anonymiser !== models.contentAnonymiser &&
          anonymiser !== models.optionsAnonymiser &&
          anonymiser !== models.emailAnonymiser
      );
      break;
    case 'none':
      fullList = [
        ...ALWAYS_ANONYMIZED_MODELS,
        ...getOptionalPassthroughAnonymisers(),
      ]
        // Remove all maps so no anonymisation occurs
        .map((a) => ({ ...a, map: {} as models.AnonymisationMap<unknown> }));
      break;
  }

  if (skipAnonymizeTables.length === 0) return fullList;

  const skipSet = new Set(skipAnonymizeTables.map((t) => t.toLowerCase()));

  return fullList.map((a) => {
    const entityName =
      typeof a.model === 'function' ? a.model.name : String(a.model);
    if (skipSet.has(entityName.toLowerCase())) {
      return {
        model: a.model,
        map: {} as models.AnonymisationMap<unknown>,
      };
    }
    return a;
  }) as models.ModelAnonymiser[];
};
