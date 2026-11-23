import { type GetCalloutsQuery, ItemStatus } from '@beabee/beabee-common';

import type { RouteLocationNormalized } from 'vue-router';
import { defineBasicLoader } from 'vue-router/experimental';

import router, { holdUntilLoaded } from '#lib/router';
import { client } from '#utils/api';

// The CrowdNewsroom list page's data. The page exports these loaders. They're
// lazy, so each block shows as soon as its own data arrives, but the page
// waits up to 300 ms for them all, until each has loaded once.

/** How many archived CrowdNewsrooms a page of the archive shows */
export const archivePageSize = 10;

/** Whether the navigation only changes the archive's page, search or filter */
const changingArchive = (to: RouteLocationNormalized) =>
  router.currentRoute.value.path === to.path &&
  router.currentRoute.value.fullPath !== to.fullPath;

let openCallouts: Awaited<ReturnType<typeof loadOpenCallouts>> | undefined;

const loadOpenCallouts = () =>
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
  );

/** The open CrowdNewsrooms, newest first, kept while the archive changes */
export const useOpenCalloutsData = defineBasicLoader(
  async (to) => {
    if (!openCallouts || !changingArchive(to)) {
      openCallouts = await holdUntilLoaded('callouts', loadOpenCallouts());
    }
    return openCallouts;
  },
  { lazy: true }
);

let archivedTotal: number | undefined;

/** How many CrowdNewsrooms the archive holds, kept while it pages */
export const useArchivedTotalData = defineBasicLoader(
  async (to) => {
    if (archivedTotal === undefined || !changingArchive(to)) {
      const archived = await holdUntilLoaded(
        'callouts-archive-total',
        client.callout.list({
          limit: 1,
          rules: {
            condition: 'AND',
            rules: [
              { field: 'status', operator: 'equal', value: [ItemStatus.Ended] },
              { field: 'hidden', operator: 'equal', value: [false] },
            ],
          },
        })
      );
      archivedTotal = archived.total;
    }
    return archivedTotal;
  },
  { lazy: true }
);

/** The archive page, search and filter in the URL, loaded again as they change */
export const useArchivedCalloutsData = defineBasicLoader(
  (to) => {
    const page = Number(to.query.page) || 0;
    const search = to.query.s?.toString() || '';
    const answeredOnly = to.query.show === 'answered';

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

    return holdUntilLoaded(
      'callouts-archive',
      client.callout.list(query, ['hasAnswered', 'responseCount'])
    );
  },
  { lazy: true }
);
