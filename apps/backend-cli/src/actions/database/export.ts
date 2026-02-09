/**
 * Database Export Module
 *
 * This module provides functionality to export database data to JSON or SQL dumps.
 * It supports:
 * - Full or demo subset exports
 * - Configurable anonymization (contacts always anonymized for privacy)
 * - JSON and SQL output formats
 */
import { runApp } from '@beabee/core/server';
import {
  anonymiseModel,
  clearModels,
} from '@beabee/core/tools/database/anonymisers/index';

import { getAnonymizers } from '../../utils/anonymizers.js';

/**
 * Export database to JSON or SQL dump with configurable anonymization and subset options
 *
 * @param dryRun If true, only logs what would be done
 * @param anonymize If true, anonymize all data (contacts are always anonymized)
 */
export const exportDatabase = async (
  dryRun = false,
  anonymize = true
): Promise<void> => {
  const anonymisers = getAnonymizers(anonymize);

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
    const valueMap = new Map<string, unknown>();

    clearModels(anonymisers);

    for (const anonymiser of anonymisers) {
      await anonymiseModel(anonymiser, (qb) => qb, valueMap);
    }
  });
};
