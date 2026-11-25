import { runTransaction } from '@beabee/core/database';
import { runApp } from '@beabee/core/server';

import chalk from 'chalk';

import { EVENT_BACKFILL_CATEGORIES } from '../../constants/event.js';
import type {
  BackfillEventsArgs,
  EventBackfillCategory,
  EventBackfiller,
  EventDuplicateRule,
} from '../../types/index.js';
import { calloutBackfills } from './backfill-callouts.js';
import { contactBackfills } from './backfill-contacts.js';
import { emailBackfills } from './backfill-emails.js';
import { paymentBackfills } from './backfill-payments.js';
import { cleanupDuplicates } from './cleanup.js';

const backfillers: Record<EventBackfillCategory, EventBackfiller[]> = {
  contact: contactBackfills,
  callout: calloutBackfills,
  email: emailBackfills,
  payment: paymentBackfills,
};
/**
 * Backfill activity events for a single category, or for every category when
 * `all` is given, then remove duplicates of the backfilled events.
 */
export const backfillEvents = async ({
  category,
  danger,
}: BackfillEventsArgs): Promise<void> => {
  const categories =
    category === 'all' ? EVENT_BACKFILL_CATEGORIES : [category];

  await runApp(async () => {
    const backfilled: { rule: EventDuplicateRule; ids: string[] }[] = [];
    // Use a common transaction per event-category. A failed category is rolled
    // back and skipped, the others still run
    for (const c of categories) {
      try {
        const results = await runTransaction(async (em) => {
          const categoryResults = [];
          for (const rule of backfillers[c]) {
            categoryResults.push({
              rule,
              ids: await rule.backfill(danger, em),
            });
          }
          return categoryResults;
        });
        backfilled.push(...results);
      } catch (err) {
        console.log(
          `${chalk.red('✗')} Failed ${c} backfill, no ${c} events were added: ${err}`
        );
      }
    }
    if (danger) {
      await cleanupDuplicates(backfilled);
    }
  });
};
