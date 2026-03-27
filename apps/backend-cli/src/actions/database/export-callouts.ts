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
import { runApp } from '@beabee/core/server';
import {
  anonymiseModel,
  clearModels,
} from '@beabee/core/tools/database/anonymisers/index';

import {
  CALLOUT_EXPORT_ANONYMIZERS,
  CALLOUT_EXPORT_CLEAR_MODELS,
  CALLOUT_EXPORT_FULL_ANONYMIZERS,
  CALLOUT_EXPORT_PASSTHROUGH_ANONYMIZERS,
} from '../../utils/anonymizers.js';
import { withFileOutput } from '../../utils/file-output.js';

/**
 * Export callout data to SQL dump
 *
 * @param dryRun If true, only logs what would be done
 * @param anonymize If true, anonymize personal data (contact FKs, guest info)
 * @param preserveCalloutAnswers If true, keep answers intact; if false, anonymize per component type
 * @param filePath If set, write output to this file instead of stdout
 */
export const exportCalloutsDatabase = async (
  dryRun = false,
  anonymize = true,
  preserveCalloutAnswers = true,
  filePath?: string
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
    return;
  }

  await runApp(async () => {
    await withFileOutput(filePath, async () => {
      const valueMap = new Map<string, unknown>();

      clearModels(CALLOUT_EXPORT_CLEAR_MODELS);

      for (const anonymiser of anonymisers) {
        await anonymiseModel(anonymiser, (qb) => qb, valueMap);
      }
    });
  });
};
