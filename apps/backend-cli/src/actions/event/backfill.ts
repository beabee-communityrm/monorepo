import { runApp } from '@beabee/core/server';

import { EVENT_BACKFILL_CATEGORIES } from '../../constants/event.js';
import type {
  BackfillEventsArgs,
  EventBackfillCategory,
  EventBackfiller,
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
    const backfilled = [];
    for (const rule of categories.flatMap((c) => backfillers[c])) {
      backfilled.push({ rule, ids: await rule.backfill(dryRun) });
    }
    // Nothing is inserted on a dry run, so there is nothing to clean up
    if (!dryRun) {
      await cleanupDuplicates(backfilled);
    }
  });
};
