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

import {
  CALLOUT_EXPORT_ANONYMIZERS,
  CALLOUT_EXPORT_CLEAR_MODELS,
  CALLOUT_EXPORT_FULL_ANONYMIZERS,
  CALLOUT_EXPORT_PASSTHROUGH_ANONYMIZERS,
} from '../../utils/anonymizers.js';
import {
  withFileOutput,
  withTypeOrmQueryLoggingDisabled,
} from '../../utils/file-output.js';

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

/**
 * Export callout data to SQL dump
 *
 * @param dryRun If true, only logs what would be done
 * @param anonymize If true, anonymize personal data (contact FKs, guest info)
 * @param preserveCalloutAnswers If true, keep answers intact; if false, anonymize per component type
 * @param filePath If set, write output to this file instead of stdout
 * @param slugs If set, only export callouts with these slugs (no DELETE statements emitted; use --merge on import)
 */
export const exportCalloutsDatabase = async (
  dryRun = false,
  anonymize = true,
  preserveCalloutAnswers = true,
  filePath?: string,
  slugs: string[] = []
): Promise<void> => {
  const anonymisers = !anonymize
    ? CALLOUT_EXPORT_PASSTHROUGH_ANONYMIZERS
    : preserveCalloutAnswers
      ? CALLOUT_EXPORT_ANONYMIZERS
      : CALLOUT_EXPORT_FULL_ANONYMIZERS;

  if (dryRun) {
    const modelNames = anonymisers.map((a) =>
      typeof a.model === 'function' ? a.model.name : String(a.model)
    );
    console.log('Dry run: would export callout data');
    console.log(`Anonymization: ${anonymize ? 'enabled' : 'disabled'}`);
    console.log(
      `Would export ${anonymisers.length} models:`,
      modelNames.join(', ')
    );
    if (slugs.length > 0) {
      console.log(`Filtering by slugs: ${slugs.join(', ')}`);
    }
    return;
  }

  await runApp(async () => {
    await withFileOutput(filePath, async () => {
      const valueMap = new Map<string, unknown>();

      // Keep setup logs visible and mute only SQL-emission phase to avoid file pollution.
      await withTypeOrmQueryLoggingDisabled(async () => {
        // When exporting specific callouts, skip DELETE statements —
        // the user should import with --merge to add alongside existing data.
        if (slugs.length === 0) {
          clearModels(CALLOUT_EXPORT_CLEAR_MODELS);
        }

        for (const anonymiser of anonymisers) {
          await anonymiseModel(
            anonymiser,
            buildSlugFilter(anonymiser.model, slugs),
            valueMap
          );
        }
      });
    });
  });
};
