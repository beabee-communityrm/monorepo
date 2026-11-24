import type { ActivityEventType } from '@beabee/beabee-common';

import type { EntityManager } from 'typeorm';

import { EVENT_BACKFILL_CATEGORIES } from '../constants/event.js';

export type EventBackfillCategory = (typeof EVENT_BACKFILL_CATEGORIES)[number];

export interface EventDuplicateRule {
  eventType: ActivityEventType;
  /** Whether row `a` was inserted by the backfill */
  isBackfilled: (a: 'x' | 'y') => string;
  /** Whether event `y` is the same as `x`, mirroring the backfill's `NOT EXISTS` check */
  sameEvent: string;
}

export interface EventBackfiller extends EventDuplicateRule {
  /**
   * Insert missing events, returning their ids (none on a dry run). Runs in `em`,
   * the transaction shared by every backfill of the category
   */
  backfill: (dryRun: boolean, em: EntityManager) => Promise<string[]>;
}

export interface BackfillEventsArgs {
  category: EventBackfillCategory | 'all';
  dryRun: boolean;
}

export interface EventBackfill extends EventDuplicateRule {
  /** `FROM … WHERE NOT EXISTS (…)` selecting rows without an event; `$1` is the event type */
  source: string;
  /** Values for ("targetId", "actorType", "actorId", "createdAt", "metadata") */
  fields: string;
  /** Parameters after the event type, from `$2` on */
  params?: unknown[];
}
