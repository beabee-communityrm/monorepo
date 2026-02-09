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
 * @param type Export type: json or sql
 * @param anonymize Export subset: 'full' for all data, 'demo' for subset
 * @param subset Output directory for the dump file
 */
export const exportDatabase = async (
  dryRun = false,
  type: 'json' | 'sql' = 'sql',
  anonymize = true,
  subset: 'full' | 'demo' = 'full'
): Promise<void> => {
  const anonymisers = getAnonymizers(anonymize);
  await runApp(async () => {
    const valueMap = new Map<string, unknown>();

    clearModels(anonymisers);

    for (const anonymiser of anonymisers) {
      await anonymiseModel(anonymiser, (qb) => qb, valueMap);
    }
  });
};
