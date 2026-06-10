/**
 * Database Export Module
 *
 * This module provides functionality to export database data to SQL dumps.
 * It supports:
 * - Full export with configurable anonymization (contacts always anonymized for privacy)
 */
import { runApp } from '@beabee/core/server';
import {
  anonymiseModel,
  clearModels,
} from '@beabee/core/tools/database/anonymisers/index';

import type { ExportDatabaseArgs } from '../../types/index.js';
import { getAnonymizers } from '../../utils/anonymizers.js';
import { withTypeOrmQueryLoggingDisabled } from '../../utils/file-output.js';

export const exportDatabase = async (
  args: ExportDatabaseArgs
): Promise<void> => {
  if (args.anonymize === 'none') {
    console.error(
      '[database export] WARNING: --anonymize=none — output contains raw PII (contacts, payments, emails). Do not share this dump.'
    );
  }

  const anonymisers = getAnonymizers(args.anonymize, args.skipAnonymizeTables);

  if (args.dryRun) {
    console.log('Dry run: would export database (full)');
    console.log(
      `Would clear and anonymise ${anonymisers.length} models:`,
      anonymisers.map((a) => a.name).join(', ')
    );
    return;
  }

  await runApp(async () => {
    const anonymisedValueCache = new Map<string, unknown>();
    // Limit query-log muting to the SQL emission phase so setup logs still appear.
    await withTypeOrmQueryLoggingDisabled(async () => {
      clearModels(anonymisers);

      for (const anonymiser of anonymisers) {
        await anonymiseModel(anonymiser, (qb) => qb, anonymisedValueCache);
      }
    });
  });
};
