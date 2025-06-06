import type { Filters } from '../types/index.js';
import { ItemStatus } from '../data/index.js';

export const noticeFilters = {
  id: {
    type: 'text',
  },
  createdAt: {
    type: 'date',
  },
  updatedAt: {
    type: 'date',
  },
  name: {
    type: 'text',
  },
  expires: {
    type: 'date',
    nullable: true,
  },
  enabled: {
    type: 'boolean',
  },
  text: {
    type: 'text',
  },
  status: {
    type: 'enum',
    options: [
      ItemStatus.Draft,
      ItemStatus.Scheduled,
      ItemStatus.Open,
      ItemStatus.Ended,
    ] satisfies ItemStatus[] as ItemStatus[],
  },
} as const;
noticeFilters satisfies Filters;
