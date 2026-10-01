/**
 * Database Export Demo Module
 *
 * Exports a subset of the database: a limited number of random contacts,
 * the latest callouts, and their responses. All data is anonymized.
 * Uses the same anonymizer utils as the full export.
 */
import { createQueryBuilder } from '@beabee/core/database';
import { Callout, CalloutResponse, Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import {
  anonymiseModel,
  clearModels,
} from '@beabee/core/tools/database/anonymisers/index';
import * as models from '@beabee/core/tools/database/anonymisers/models';

import { Brackets } from 'typeorm';
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';

import type { ExportDemoArgs } from '../../types/index.js';
import { withTypeOrmQueryLoggingDisabled } from '../../utils/file-output.js';

/**
 * Context for demo export: IDs of the subset to export
 */
interface DemoExportContext {
  contactIds: string[];
  calloutIds: string[];
  responseIds: string[];
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
 * Demo subset: all anonymisers to apply (contacts, callouts, responses)
 */
export const DEMO_ANONYMISERS = [
  ...DEMO_CONTACT_ANONYMIZERS,
  ...DEMO_CALLOUT_ANONYMIZERS,
  ...DEMO_CALLOUT_RESPONSE_ANONYMIZERS,
] as models.ModelAnonymiser[];

/**
 * Models cleared in demo export but not repopulated (link tables / dependent data)
 */
export const DEMO_CLEAR_ANONYMIZERS = [
  ...DEMO_ANONYMISERS,
  models.calloutResponseCommentsAnonymiser,
  models.projectContactsAnonymiser,
  models.projectEngagementsAnonymiser,
  models.segmentContactsAnonymiser,
  models.referralsAnonymiser,
  models.resetSecurityFlowAnonymiser,
  models.signupFlowAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Fetches the IDs for a random subset of contacts, the latest callouts, and
 * their responses to use as the context for the demo export
 */
async function fetchDemoContext(
  contactLimit: number,
  calloutLimit: number
): Promise<DemoExportContext> {
  const contacts = await createQueryBuilder(Contact, 'item')
    .select('item.id')
    .orderBy('random()')
    .limit(contactLimit)
    .getMany();
  const contactIds = contacts.map((m) => m.id);

  const callouts = await createQueryBuilder(Callout, 'item')
    .select('item.id')
    .orderBy('item.date', 'DESC')
    .limit(calloutLimit)
    .getMany();
  const calloutIds = callouts.map((c) => c.id);

  // Fetch only responses for given callouts and where they only refer to
  // existing contacts (or no contact at all)
  const responses = await createQueryBuilder(CalloutResponse, 'item')
    .select('item.id')
    .where('item.calloutId IN (:...ids)', { ids: calloutIds })
    .andWhere(
      new Brackets((qb) =>
        qb
          .where('item.contactId IS NULL')
          .orWhere('item.contactId IN (:...contacts)')
      ),
      { contacts: contactIds }
    )
    .andWhere(
      new Brackets((qb) =>
        qb
          .where('item.assigneeId IS NULL')
          .orWhere('item.assigneeId IN (:...contacts)')
      ),
      { contacts: contactIds }
    )
    .getMany();
  const responseIds = responses.map((r) => r.id);

  return { contactIds, calloutIds, responseIds };
}

/**
 * Returns a query filter which restricts the export to the demo subset based on
 * which model is being anonymized.
 *
 * This is a fairly hacky way to:
 * - Return the right filter for each anonymiser based on which table it
 *   operates on (contact, callout, response)
 * - Select the key name based on if it's the main entity table or a related
 *   table (e.g. contactId vs id)
 */
export function getDemoPrepareQuery(
  anonymiser: models.ModelAnonymiser,
  context: DemoExportContext
): (
  qb: SelectQueryBuilder<ObjectLiteral>
) => SelectQueryBuilder<ObjectLiteral> {
  if (DEMO_CONTACT_ANONYMIZERS.includes(anonymiser)) {
    const pk = anonymiser === models.contactAnonymiser ? 'id' : 'contactId';
    return (qb) =>
      qb.where(`item.${pk} IN (:...contacts)`, {
        contacts: context.contactIds,
      });
  } else if (DEMO_CALLOUT_ANONYMIZERS.includes(anonymiser)) {
    const pk = anonymiser === models.calloutsAnonymiser ? 'id' : 'calloutId';
    return (qb) =>
      qb.where(`item.${pk} IN (:...ids)`, { ids: context.calloutIds });
  } else if (DEMO_CALLOUT_RESPONSE_ANONYMIZERS.includes(anonymiser)) {
    const pk =
      anonymiser === models.calloutResponsesAnonymiser ? 'id' : 'responseId';
    return (qb) =>
      qb.where(`item.${pk} IN (:...responses)`, {
        responses: context.responseIds,
      });
  } else {
    return (qb) => qb;
  }
}

export const exportDemoDatabase = async (
  args: ExportDemoArgs
): Promise<void> => {
  if (args.dryRun) {
    console.log('Dry run: would export database (demo subset)');
    console.log(
      `Would export up to ${args.contactLimit} random contacts, ${args.calloutLimit} latest callouts, and their responses (anonymized)`
    );
    return;
  }

  await runApp(async () => {
    const context = await fetchDemoContext(
      args.contactLimit,
      args.calloutLimit
    );

    const anonymisedValueCache = new Map<string, unknown>();

    await withTypeOrmQueryLoggingDisabled(async () => {
      clearModels(DEMO_CLEAR_ANONYMIZERS);

      for (const anonymiser of DEMO_ANONYMISERS) {
        await anonymiseModel(
          anonymiser,
          getDemoPrepareQuery(anonymiser, context),
          anonymisedValueCache
        );
      }
    });
  });
};
