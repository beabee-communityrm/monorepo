import { ActivityActorType, ActivityEventType } from '../data/index.js';
import type { Filters } from '../types/index.js';

export const activityFilters = {
  id: {
    type: 'text',
  },
  targetId: {
    type: 'contact',
    nullable: true,
  },
  eventType: {
    type: 'enum',
    options: Object.values(ActivityEventType),
  },
  actorType: {
    type: 'enum',
    options: Object.values(ActivityActorType),
  },
  actorId: {
    type: 'contact',
    nullable: true,
  },
  createdAt: {
    type: 'date',
  },
} as const;

activityFilters satisfies Filters;
