/**
 * Database Export Demo Module
 *
 * Exports a subset of the database: a limited number of random contacts,
 * the latest callouts, and their responses. All data is anonymized.
 * Uses the same anonymizer utils as the full export.
 */
import { createQueryBuilder } from '@beabee/core/database';
import { Callout, CalloutResponse, Contact } from '@beabee/core/models';
import { runApp } from '@beabee/core/server';
import {
  anonymiseModel,
  clearModels,
} from '@beabee/core/tools/database/anonymisers/index';

import { Brackets } from 'typeorm';

import {
  DEMO_EXPORT_CONFIG,
  type DemoExportContext,
  getDemoAnonymisers,
  getDemoClearModels,
  getDemoPrepareQuery,
} from '../../utils/anonymizers.js';

/**
 * Fetch the subset of IDs used for demo export (must be called inside runApp)
 */
async function fetchDemoContext(options: {
  contacts?: number;
  callouts?: number;
}): Promise<DemoExportContext> {
  const contactLimit = options.contacts ?? DEMO_EXPORT_CONFIG.contacts;
  const calloutLimit = options.callouts ?? DEMO_EXPORT_CONFIG.callouts;

  const contacts = await createQueryBuilder(Contact, 'item')
    .select('item.id')
    .orderBy('random()')
    .limit(contactLimit)
    .getMany();
  const contactIds = contacts.map((m) => m.id);

  const callouts = await createQueryBuilder(Callout, 'item')
    .select('item.id')
    .orderBy('item.date', 'DESC')
    .limit(calloutLimit)
    .getMany();
  const calloutIds = callouts.map((c) => c.id);

  const responses = await createQueryBuilder(CalloutResponse, 'item')
    .select('item.id')
    .where('item.calloutId IN (:...ids)', { ids: calloutIds })
    .andWhere(
      new Brackets((qb) =>
        qb
          .where('item.contactId IS NULL')
          .orWhere('item.contactId IN (:...contacts)')
      ),
      { contacts: contactIds }
    )
    .andWhere(
      new Brackets((qb) =>
        qb
          .where('item.assigneeId IS NULL')
          .orWhere('item.assigneeId IN (:...contacts)')
      ),
      { contacts: contactIds }
    )
    .getMany();
  const responseIds = responses.map((r) => r.id);

  return { contactIds, calloutIds, responseIds };
}

/**
 * Export a demo subset of the database (limited contacts, latest callouts, and responses).
 *
 * @param dryRun If true, only logs what would be done
 */
export const exportDemoDatabase = async (dryRun = false): Promise<void> => {
  if (dryRun) {
    console.log('Dry run: would export database (demo subset)');
    console.log(
      `Would export up to ${DEMO_EXPORT_CONFIG.contacts} random contacts, ${DEMO_EXPORT_CONFIG.callouts} latest callouts, and their responses (anonymized)`
    );
    return;
  }

  await runApp(async () => {
    const valueMap = new Map<string, unknown>();
    const context = await fetchDemoContext(DEMO_EXPORT_CONFIG);
    const anonymisers = getDemoAnonymisers();
    const modelsToClear = getDemoClearModels();
    clearModels(modelsToClear);
    for (const anonymiser of anonymisers) {
      await anonymiseModel(
        anonymiser,
        getDemoPrepareQuery(anonymiser, context),
        valueMap
      );
    }
  });
};
