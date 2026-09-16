import { EVENT_BACKFILL_CATEGORIES } from '../constants/event.js';

export type EventBackfillCategory = (typeof EVENT_BACKFILL_CATEGORIES)[number];

export interface BackfillEventsArgs {
  category: EventBackfillCategory | 'all';
  dryRun: boolean;
}
