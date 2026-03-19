import type { Filters } from '../types/index.js';

export const emailFilters = {
  id: {
    type: 'text',
  },
  templateId: {
    type: 'text',
    nullable: true,
  },
  name: {
    type: 'text',
  },
  fromName: {
    type: 'text',
    nullable: true,
  },
  fromEmail: {
    type: 'text',
    nullable: true,
  },
  subject: {
    type: 'text',
  },
  body: {
    type: 'text',
  },
  date: {
    type: 'date',
  },
} as const;
emailFilters satisfies Filters;
