import type { PaginatedQuery } from './index.js';

/**
 * Query parameters for listing emails
 */
export interface GetEmailsQuery extends PaginatedQuery {
  sort?: 'name' | 'date';
}
