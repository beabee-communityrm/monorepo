import { createQueryBuilder } from '@beabee/core/database';
import { Callout, CalloutResponse, Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import {
  anonymiseModel,
  clearModels,
  initializeJsonDump,
  saveJsonDump,
} from '@beabee/core/tools/database/anonymisers/index';

import { Brackets } from 'typeorm';

import {
  ALWAYS_ANONYMIZED_MODELS,
  DEMO_EXPORT_CONFIG,
  OPTIONALLY_ANONYMIZED_MODELS,
  getAllModels,
  getAnonymizers,
} from './anonymization.js';

export interface ExportOptions {
  /** If true, anonymize all data. If false, only anonymize contacts */
  anonymize?: boolean;
  /** Export subset: 'full' for all data, 'demo' for subset */
  subset?: 'full' | 'demo';
  /** Output directory for the dump file */
  outputDir?: string | undefined;
}

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

    if (type === 'json') {
      initializeJsonDump(getAllModels());
    } else {
      clearModels(anonymisers);
    }

    if (subset === 'demo') {
      await exportDemoSubset(anonymisers, valueMap, type);
    } else {
      // Export all data
      for (const anonymiser of anonymisers) {
        await anonymiseModel(anonymiser, (qb) => qb, valueMap, type);
      }
    }

    // If not anonymizing everything and using JSON, we need to export the remaining models as-is
    if (!anonymize && type === 'json') {
      // TODO: Export non-anonymised models directly
      // This would require a separate function to export models without anonymisation
      console.warn('Non-anonymised JSON export is not fully implemented yet');
    }

    if (type === 'json') {
      await saveJsonDump(dryRun, outputDir);
    }
  });
};

/**
 * Export a demo subset of the database
 * Includes 400 random contacts, 20 latest callouts, and related data
 */
const exportDemoSubset = async (
  anonymisers: any[],
  valueMap: Map<string, unknown>,
  type: 'json' | 'sql'
): Promise<void> => {
  // Get demo subset of contacts
  const contacts = await createQueryBuilder(Contact, 'item')
    .select('item.id')
    .orderBy('random()')
    .limit(DEMO_EXPORT_CONFIG.contacts)
    .getMany();
  const contactIds = contacts.map((m) => m.id);

  // Get demo subset of callouts
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

  // Process contact-related anonymizers
  const contactAnonymisers = [
    ...ALWAYS_ANONYMIZED_MODELS.filter(
      (a: any) =>
        a.model === Contact ||
        ['contactRole', 'contactProfile', 'contactContribution'].includes(
          a.model.name
        )
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

  // Process callout-related anonymizers
  const calloutAnonymisers = anonymisers.filter(
    (a: any) =>
      a.model === Callout ||
      ['calloutTags', 'calloutVariant'].includes(a.model.name)
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

  // Process callout response-related anonymizers
  const responseAnonymisers = anonymisers.filter(
    (a: any) =>
      a.model === CalloutResponse ||
      ['calloutResponseTags'].includes(a.model.name)
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

  // Clear other models that link to contacts
  const clearAnonymisers: any[] = [
    // Add other models that should be cleared in demo exports
  ];

  for (const anonymiser of clearAnonymisers) {
    await anonymiseModel(anonymiser, (qb) => qb.where('1=0'), valueMap, type);
  }
};
