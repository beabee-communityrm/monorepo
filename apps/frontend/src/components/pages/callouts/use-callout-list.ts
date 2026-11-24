import { type GetCalloutsQuery, ItemStatus } from '@beabee/beabee-common';

import { keepPreviousData, queryOptions } from '@tanstack/vue-query';
import type { LocationQuery } from 'vue-router';

import { routeQuery } from '#lib/route-queries';
import type { RouteQueries } from '#type';
import { client } from '#utils/api';

// The CrowdNewsroom list page's queries. The page exports them as
// `routeQueries`, and each block reads its own, so a slow block doesn't hold
// up the rest.

/** How many archived CrowdNewsrooms a page of the archive shows */
export const archivePageSize = 10;

/** The open CrowdNewsrooms, newest first */
export const openCalloutsQuery = queryOptions({
  queryKey: ['callouts', 'open'],
  queryFn: () =>
    client.callout.list(
      {
        sort: 'starts',
        order: 'DESC',
        rules: {
          condition: 'AND',
          rules: [
            { field: 'status', operator: 'equal', value: [ItemStatus.Open] },
            { field: 'hidden', operator: 'equal', value: [false] },
          ],
        },
      },
      ['hasAnswered', 'responseCount']
    ),
});

/** How many CrowdNewsrooms the archive holds */
export const archivedTotalQuery = queryOptions({
  queryKey: ['callouts', 'archived', 'total'],
  queryFn: async () => {
    const archived = await client.callout.list({
      limit: 1,
      rules: {
        condition: 'AND',
        rules: [
          { field: 'status', operator: 'equal', value: [ItemStatus.Ended] },
          { field: 'hidden', operator: 'equal', value: [false] },
        ],
      },
    });
    return archived.total;
  },
});

/** The archive page, search and filter, from the URL */
export const archiveParams = (query: LocationQuery) => ({
  page: Number(query.page) || 0,
  search: query.s?.toString() || '',
  answeredOnly: query.show === 'answered',
});

/**
 * A page of the archive. While the next page loads, the previous one stays.
 *
 * @param params The archive page, search and filter
 */
export const archivedCalloutsQuery = ({
  page,
  search,
  answeredOnly,
}: ReturnType<typeof archiveParams>) => {
  const query: GetCalloutsQuery = {
    offset: page * archivePageSize,
    limit: archivePageSize,
    sort: 'expires',
    order: 'DESC',
    rules: {
      condition: 'AND',
      rules: [
        { field: 'title', operator: 'contains', value: [search] },
        { field: 'hidden', operator: 'equal', value: [false] },
        { field: 'status', operator: 'equal', value: [ItemStatus.Ended] },
        ...(answeredOnly
          ? [
              {
                field: 'answeredBy' as const,
                operator: 'equal' as const,
                value: ['me'],
              },
            ]
          : []),
      ],
    },
  };

  return queryOptions({
    queryKey: ['callouts', 'archived', { page, search, answeredOnly }],
    queryFn: () => client.callout.list(query, ['hasAnswered', 'responseCount']),
    placeholderData: keepPreviousData,
  });
};

export const calloutListQueries: RouteQueries = (to) => [
  routeQuery(openCalloutsQuery),
  routeQuery(archivedTotalQuery),
  routeQuery(archivedCalloutsQuery(archiveParams(to.query))),
];
