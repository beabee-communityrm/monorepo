/**
 * Database Export Callouts Module
 *
 * Exports only callout and callout response data for migration testing.
 * Keeps formSchema and answers intact (not anonymised) so the actual
 * data structures can be analysed and migration behaviour verified.
 *
 * Contact FKs are NULLed and guest personal data is anonymised by default.
 * Contacts are NOT included, so importing this dump will not overwrite
 * existing user accounts.
 */
import { Callout } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import {
  anonymiseModel,
  clearModels,
} from '@beabee/core/tools/database/anonymisers/index';
import * as models from '@beabee/core/tools/database/anonymisers/models';

import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import type { ExportCalloutsArgs } from '../../types/index.js';
import { getAnonymizers } from '../../utils/anonymizers.js';
import { withTypeOrmQueryLoggingDisabled } from '../../utils/file-output.js';

/**
 * Callout subset
 */
export const CALLOUT_ANONYMIZERS = [
  models.calloutsAnonymiser,
  models.calloutTagsAnonymiser,
  models.calloutVariantAnonymiser,
  models.calloutResponsesAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Models cleared in callout export but not repopulated (link tables / dependent data)
 */
export const CALLOUT_CLEAR_ANONYMIZERS: models.ModelAnonymiser[] = [
  ...CALLOUT_ANONYMIZERS,
  models.calloutReviewerAnonymiser,
  models.calloutResponseSegmentsAnonymiser,
  models.calloutResponseTagsAnonymiser,
  models.calloutResponseCommentsAnonymiser,
] as models.ModelAnonymiser[];

/**
 * Returns a query filter which restricts the export to the callout slugs
 * specified by the user (if any).
 *
 * This is a fairly hacky way to:
 * - Select based on "slug" for callouts
 * - Select based on "calloutId" for related models
 */
function getExportPrepareQuery(
  anonymiser: models.ModelAnonymiser,
  slugs: string[]
): (
  qb: SelectQueryBuilder<ObjectLiteral>
) => SelectQueryBuilder<ObjectLiteral> {
  if (slugs.length === 0) {
    return (qb) => qb;
  }

  const whereClause =
    anonymiser === models.calloutsAnonymiser
      ? 'item.slug IN (:...slugs)'
      : 'item."calloutId" IN (SELECT id FROM callout WHERE slug IN (:...slugs))';

  return (qb) => qb.where(whereClause, { slugs });
}

export const exportCalloutsDatabase = async (
  args: ExportCalloutsArgs
): Promise<void> => {
  if (args.anonymize === 'none') {
    console.error(
      '[database export-callouts] WARNING: --anonymize=none — output contains raw guest names and emails. Do not share this dump.'
    );
  }

  // TODO: args.preserveCalloutAnswers
  const anonymisers = getAnonymizers(args.anonymize, [], CALLOUT_ANONYMIZERS);

  if (args.dryRun) {
    console.log('Dry run: would export callout data');
    console.log(`Anonymization level: ${args.anonymize}`);
    console.log(
      `Would export ${anonymisers.length} models:`,
      anonymisers.map((a) => a.name).join(', ')
    );
    if (args.calloutSlug.length > 0) {
      console.log(`Filtering by slugs: ${args.calloutSlug.join(', ')}`);
    }
    return;
  }

  await runApp(async () => {
    const anonymisedValueCache = new Map<string, unknown>();

    // Keep setup logs visible and mute only SQL-emission phase to avoid file pollution.
    await withTypeOrmQueryLoggingDisabled(async () => {
      // When exporting specific callouts, skip DELETE statements —
      // the user should import alongside existing data.
      // TODO: could be cleaner with a --clear/--no-clear option instead of overloading --calloutSlug
      if (args.calloutSlug.length === 0) {
        clearModels(CALLOUT_CLEAR_ANONYMIZERS);
      }

      for (const anonymiser of anonymisers) {
        await anonymiseModel(
          anonymiser,
          getExportPrepareQuery(anonymiser, args.calloutSlug),
          anonymisedValueCache
        );
      }
    });
  });
};
