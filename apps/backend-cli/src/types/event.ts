import type { ActivityEventType } from '@beabee/beabee-common';

import { EVENT_BACKFILL_CATEGORIES } from '../constants/event.js';

export type EventBackfillCategory = (typeof EVENT_BACKFILL_CATEGORIES)[number];

export interface EventDuplicateRule {
  eventType: ActivityEventType;
  /** Whether row `a` was inserted by the backfill */
  isBackfilled: (a: 'x' | 'y') => string;
  /** Whether `y` is the same event as `x`, matching the backfill's dedup check */
  sameEvent: string;
}

export interface BackfillEventsArgs {
  category: EventBackfillCategory | 'all';
  dryRun: boolean;
}
