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

import type { AnonymizationLevel } from '../../types/index.js';
import { getAnonymizers } from '../../utils/anonymizers.js';
import {
  withFileOutput,
  withTypeOrmQueryLoggingDisabled,
} from '../../utils/file-output.js';

/**
 * Export database to SQL dump with configurable anonymization level
 *
 * @param dryRun If true, only logs what would be done
 * @param level Anonymisation level: 'full' (all data anonymised), 'safe' (contacts/payments/emails/segments anonymised, other tables raw) or 'none' (everything raw, including PII)
 * @param skipAnonymizeTables If provided, skip anonymization for the given table names
 * @param preserveCalloutAnswers If true, keep callout response answers intact (only anonymize FKs/guest data)
 * @param filePath If set, write output to this file instead of stdout
 */
export const exportDatabase = async (
  dryRun = false,
  level: AnonymizationLevel = 'full',
  skipAnonymizeTables: string[] = [],
  preserveCalloutAnswers = false,
  filePath?: string
): Promise<void> => {
  if (level === 'none') {
    console.error(
      '[database export] WARNING: --anonymize=none — output contains raw PII (contacts, payments, emails). Do not share this dump.'
    );
  }

  const anonymisers = getAnonymizers(
    level,
    skipAnonymizeTables,
    preserveCalloutAnswers
  );

  if (dryRun) {
    const modelNames = anonymisers.map((a) =>
      typeof a.model === 'function' ? a.model.name : String(a.model)
    );
    console.log('Dry run: would export database (full)');
    console.log(
      `Would clear and anonymise ${anonymisers.length} models:`,
      modelNames.join(', ')
    );
    return;
  }

  await runApp(async () => {
    await withFileOutput(filePath, async () => {
      const valueMap = new Map<string, unknown>();
      // Limit query-log muting to the SQL emission phase so setup logs still appear.
      await withTypeOrmQueryLoggingDisabled(async () => {
        clearModels(anonymisers);

        for (const anonymiser of anonymisers) {
          await anonymiseModel(anonymiser, (qb) => qb, valueMap);
        }
      });
    });
  });
};
