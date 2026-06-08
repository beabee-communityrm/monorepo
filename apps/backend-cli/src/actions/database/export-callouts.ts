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
import type { ModelAnonymiser } from '@beabee/core/tools/database/anonymisers/models';

import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import type { ExportCalloutsArgs } from '../../types/index.js';
import {
  CALLOUT_EXPORT_ANONYMIZERS,
  CALLOUT_EXPORT_CLEAR_MODELS,
  CALLOUT_EXPORT_FULL_ANONYMIZERS,
  CALLOUT_EXPORT_PASSTHROUGH_ANONYMIZERS,
} from '../../utils/anonymizers.js';
import { withTypeOrmQueryLoggingDisabled } from '../../utils/file-output.js';

/**
 * Build a prepareQuery function that filters by callout slugs.
 * For the Callout model itself, filters by slug; for related models, filters by calloutId subquery.
 */
function buildSlugFilter(
  model: ModelAnonymiser['model'],
  slugs: string[]
): (
  qb: SelectQueryBuilder<ObjectLiteral>
) => SelectQueryBuilder<ObjectLiteral> {
  if (slugs.length === 0) {
    return (qb) => qb;
  }

  if (model === Callout) {
    return (qb) => qb.where('item.slug IN (:...slugs)', { slugs });
  }
  return (qb) =>
    qb.where(
      'item."calloutId" IN (SELECT id FROM callout WHERE slug IN (:...slugs))',
      { slugs }
    );
}

export const exportCalloutsDatabase = async (
  args: ExportCalloutsArgs
): Promise<void> => {
  if (args.anonymize === 'none') {
    console.error(
      '[database export-callouts] WARNING: --anonymize=none — output contains raw guest names and emails. Do not share this dump.'
    );
  }

  const anonymisers =
    args.anonymize === 'none'
      ? CALLOUT_EXPORT_PASSTHROUGH_ANONYMIZERS
      : args.preserveCalloutAnswers
        ? CALLOUT_EXPORT_ANONYMIZERS
        : CALLOUT_EXPORT_FULL_ANONYMIZERS;

  if (args.dryRun) {
    const modelNames = anonymisers.map((a) =>
      typeof a.model === 'function' ? a.model.name : String(a.model)
    );
    console.log('Dry run: would export callout data');
    console.log(`Anonymization level: ${args.anonymize}`);
    console.log(
      `Would export ${anonymisers.length} models:`,
      modelNames.join(', ')
    );
    if (args.calloutSlug.length > 0) {
      console.log(`Filtering by slugs: ${args.calloutSlug.join(', ')}`);
    }
    return;
  }

  await runApp(async () => {
    const valueMap = new Map<string, unknown>();

    // Keep setup logs visible and mute only SQL-emission phase to avoid file pollution.
    await withTypeOrmQueryLoggingDisabled(async () => {
      // When exporting specific callouts, skip DELETE statements —
      // the user should import alongside existing data.
      if (args.calloutSlug.length === 0) {
        clearModels(CALLOUT_EXPORT_CLEAR_MODELS);
      }

      for (const anonymiser of anonymisers) {
        await anonymiseModel(
          anonymiser,
          buildSlugFilter(anonymiser.model, args.calloutSlug),
          valueMap
        );
      }
    });
  });
};
