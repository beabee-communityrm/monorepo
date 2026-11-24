import { runTransaction } from '@beabee/core/database';
import { runApp } from '@beabee/core/server';

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
  dryRun,
}: BackfillEventsArgs): Promise<void> => {
  const categories =
    category === 'all' ? EVENT_BACKFILL_CATEGORIES : [category];

  await runApp(async () => {
    const backfilled: { rule: EventDuplicateRule; ids: string[] }[] = [];
    // Use a common transaction per event-category
    for (const c of categories) {
      await runTransaction(async (em) => {
        for (const rule of backfillers[c]) {
          backfilled.push({ rule, ids: await rule.backfill(dryRun, em) });
        }
      });
    }
    // Nothing is inserted on a dry run, so there is nothing to clean up
    if (!dryRun) {
      await cleanupDuplicates(backfilled);
    }
  });
};
