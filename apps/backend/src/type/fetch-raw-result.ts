import { PaginatedQuery } from '@beabee/beabee-common';

import { ObjectLiteral } from 'typeorm';

export interface FetchRawResult<
  Model extends ObjectLiteral,
  Query extends PaginatedQuery,
> {
  items: Model[];
  total: number;
  query: Query;
  offset: number;
}
