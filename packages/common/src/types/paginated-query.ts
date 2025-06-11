import type { RuleGroup } from './index.js';

export interface PaginatedQuery {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  rules?: RuleGroup;
}
