import type { Filters } from '../types/index.js';

export const activityFilters = {
  targetId: {
    type: 'contact',
    nullable: true,
  },
  createdAt: {
    type: 'date',
  },
} as const;

activityFilters satisfies Filters;
