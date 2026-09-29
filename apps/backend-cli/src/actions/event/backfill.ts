import { runApp } from '@beabee/core/server';

import { EVENT_BACKFILL_CATEGORIES } from '../../constants/event.js';
import type {
  BackfillEventsArgs,
  EventBackfillCategory,
} from '../../types/index.js';
import { backfillCallouts } from './backfill-callouts.js';
import { backfillContacts } from './backfill-contacts.js';
import { backfillEmails } from './backfill-emails.js';
import { backfillPayments } from './backfill-payments.js';

const backfillers: Record<
  EventBackfillCategory,
  (dryRun: boolean) => Promise<void>
> = {
  contact: backfillContacts,
  callout: backfillCallouts,
  email: backfillEmails,
  payment: backfillPayments,
};

/**
 * Backfill activity events for a single category, or for every category when
 * `all` is given.
 */
export const backfillEvents = async ({
  category,
  dryRun,
}: BackfillEventsArgs): Promise<void> => {
  const categories =
    category === 'all' ? EVENT_BACKFILL_CATEGORIES : [category];

  await runApp(async () => {
    for (const c of categories) {
      await backfillers[c](dryRun);
    }
  });
};
