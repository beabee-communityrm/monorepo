/**
 * Database Export Module
 *
 * This module provides functionality to export database data to JSON or SQL dumps.
 * It supports:
 * - Full or demo subset exports
 * - Configurable anonymization (contacts always anonymized for privacy)
 * - JSON and SQL output formats
 */
import { createQueryBuilder } from '@beabee/core/database';
import { Callout, CalloutResponse, Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import {
  ModelAnonymiser,
  anonymiseModel,
  exportModelAsIs,
  initializeJsonDump,
  initializeSqlDump,
  saveJsonDump,
  saveSqlDump,
} from '@beabee/core/tools/database/anonymisers/index';

import { Brackets, ObjectLiteral } from 'typeorm';

import {
  ALWAYS_ANONYMIZED_MODELS,
  DEMO_EXPORT_CONFIG,
  OPTIONALLY_ANONYMIZED_MODELS,
  getAllModels,
  getAnonymizers,
} from './anonymization.js';

// ============================================================================
// Types
// ============================================================================

export interface ExportOptions {
  /** If true, anonymize all data. If false, only anonymize contacts */
  anonymize?: boolean;
  /** Export subset: 'full' for all data, 'demo' for subset */
  subset?: 'full' | 'demo';
  /** Output directory for the dump file */
  outputDir?: string | undefined;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Export database to JSON or SQL dump with configurable anonymization and subset options
 *
 * @param dryRun If true, only logs what would be done
 * @param type Export type: json or sql
 * @param options Export configuration options
 */
export const exportDatabase = async (
  dryRun = false,
  type: 'json' | 'sql' = 'json',
  options: ExportOptions = {}
): Promise<void> => {
  const {
    anonymize = true,
    subset = 'full',
    outputDir = '../../packages/test-utils/database-dumps',
  } = options;

  await runApp(async () => {
    const valueMap = new Map<string, unknown>();
    const anonymisers = getAnonymizers(anonymize);
    const allModels = getAllModels();

    // Initialize dump based on export type
    // Both need all models to ensure complete table initialization/clearing
    if (type === 'json') {
      initializeJsonDump(allModels, outputDir);
    } else {
      initializeSqlDump(allModels, outputDir);
    }

    // Export data based on subset selection
    if (subset === 'demo') {
      await exportDemoSubset(anonymisers, valueMap, type);
    } else {
      await exportFullDatabase(anonymisers, valueMap, type);
    }

    // Export non-anonymized models if requested
    // Pass valueMap to remap foreign keys to anonymized models
    if (!anonymize) {
      await exportNonAnonymizedModels(anonymisers, type, valueMap);
    }

    // Save the dump
    (await type) === 'json' ? saveJsonDump(dryRun) : saveSqlDump(dryRun);
  });
};

// ============================================================================
// Export Strategies
// ============================================================================

/**
 * Export the full database
 * Processes all models with their respective anonymizers
 *
 * @param anonymisers List of model anonymizers to use
 * @param valueMap Map to track anonymized values for consistency
 * @param type Export format (json or sql)
 */
const exportFullDatabase = async (
  anonymisers: ModelAnonymiser<ObjectLiteral>[],
  valueMap: Map<string, unknown>,
  type: 'json' | 'sql'
): Promise<void> => {
  for (const anonymiser of anonymisers) {
    await anonymiseModel(anonymiser, (qb) => qb, valueMap, type);
  }
};

/**
 * Export a demo subset of the database
 * Includes 400 random contacts, 20 latest callouts, and related data
 *
 * @param anonymisers List of model anonymizers to use
 * @param valueMap Map to track anonymized values for consistency
 * @param type Export format (json or sql)
 */
const exportDemoSubset = async (
  anonymisers: ModelAnonymiser<ObjectLiteral>[],
  valueMap: Map<string, unknown>,
  type: 'json' | 'sql'
): Promise<void> => {
  // ========================================
  // Step 1: Select demo subset IDs
  // ========================================

  // Get random contacts
  const contacts = await createQueryBuilder(Contact, 'item')
    .select('item.id')
    .orderBy('random()')
    .limit(DEMO_EXPORT_CONFIG.contacts)
    .getMany();
  const contactIds = contacts.map((m) => m.id);

  // Get latest callouts
  const callouts = await createQueryBuilder(Callout, 'item')
    .select('item.id')
    .orderBy('item.date', 'DESC')
    .limit(DEMO_EXPORT_CONFIG.callouts)
    .getMany();
  const calloutIds = callouts.map((c) => c.id);

  // Get related callout responses
  const responses = await createQueryBuilder(CalloutResponse, 'item')
    .select('item.id')
    .where('item.calloutId IN (:...ids)', { ids: calloutIds })
    .andWhere(
      new Brackets((qb) =>
        qb
          .where('item.contact IS NULL')
          .orWhere('item.contact IN (:...contacts)')
      ),
      { contacts: contactIds }
    )
    .andWhere(
      new Brackets((qb) =>
        qb
          .where('item.assignee IS NULL')
          .orWhere('item.assignee IN (:...contacts)')
      )
    )
    .getMany();
  const responseIds = responses.map((r) => r.id);

  // ========================================
  // Step 2: Export contact-related data
  // ========================================

  const contactAnonymisers = [
    ...ALWAYS_ANONYMIZED_MODELS.filter(
      (a) =>
        a.model === Contact ||
        (typeof a.model === 'function' &&
          ['contactRole', 'contactProfile', 'contactContribution'].includes(
            a.model.name
          ))
    ),
  ];

  for (const anonymiser of contactAnonymisers) {
    const pk = anonymiser.model === Contact ? 'id' : 'contactId';
    await anonymiseModel(
      anonymiser,
      (qb) =>
        qb.where(`item.${pk} IN (:...contacts)`, { contacts: contactIds }),
      valueMap,
      type
    );
  }

  // ========================================
  // Step 3: Export callout-related data
  // ========================================

  const calloutAnonymisers = anonymisers.filter(
    (a) =>
      a.model === Callout ||
      (typeof a.model === 'function' &&
        ['calloutTags', 'calloutVariant'].includes(a.model.name))
  );

  for (const anonymiser of calloutAnonymisers) {
    const pk = anonymiser.model === Callout ? 'id' : 'calloutId';
    await anonymiseModel(
      anonymiser,
      (qb) => qb.where(`item.${pk} IN (:...ids)`, { ids: calloutIds }),
      valueMap,
      type
    );
  }

  // ========================================
  // Step 4: Export callout response data
  // ========================================

  const responseAnonymisers = anonymisers.filter(
    (a) =>
      a.model === CalloutResponse ||
      (typeof a.model === 'function' &&
        ['calloutResponseTags'].includes(a.model.name))
  );

  for (const anonymiser of responseAnonymisers) {
    const pk = anonymiser.model === CalloutResponse ? 'id' : 'responseId';
    await anonymiseModel(
      anonymiser,
      (qb) =>
        qb.where(`item.${pk} IN (:...responses)`, { responses: responseIds }),
      valueMap,
      type
    );
  }

  // ========================================
  // Step 5: Clear unused models
  // ========================================

  const clearAnonymisers: ModelAnonymiser<ObjectLiteral>[] = [
    // Add other models that should be cleared in demo exports
  ];

  for (const anonymiser of clearAnonymisers) {
    await anonymiseModel(anonymiser, (qb) => qb.where('1=0'), valueMap, type);
  }
};

/**
 * Export models without anonymization, but remap foreign keys
 * Used when anonymize=false to export OPTIONALLY_ANONYMIZED_MODELS as-is
 * but with foreign key references updated to match anonymized contact IDs
 *
 * @param excludedAnonymisers Anonymisers that are already exported (with anonymization)
 * @param type Export format (json or sql)
 * @param valueMap Map of old values to new values for FK remapping
 */
const exportNonAnonymizedModels = async (
  excludedAnonymisers: ModelAnonymiser<ObjectLiteral>[],
  type: 'json' | 'sql' = 'json',
  valueMap?: Map<string, unknown>
): Promise<void> => {
  const excludedModels = new Set(excludedAnonymisers.map((a) => a.model));

  // Get models that should be exported as-is (not already anonymized)
  const modelsToExport = OPTIONALLY_ANONYMIZED_MODELS.filter(
    (anonymiser) => !excludedModels.has(anonymiser.model)
  );

  for (const anonymiser of modelsToExport) {
    // Pass the anonymiser and valueMap to remap FK fields
    await exportModelAsIs(anonymiser.model, type, anonymiser, valueMap);
  }
};
