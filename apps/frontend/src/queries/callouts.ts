import { GetCalloutResponseWith, ItemStatus } from '@beabee/beabee-common';

import { queryOptions } from '@tanstack/vue-query';

import { client } from '#utils/api';

/** The three newest open CrowdNewsrooms */
export const latestOpenCalloutsQuery = queryOptions({
  queryKey: ['callouts', 'open', 'latest'],
  queryFn: () =>
    client.callout.list(
      {
        order: 'DESC',
        sort: 'starts',
        limit: 3,
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

/** The member's latest responses, with their CrowdNewsrooms */
export const fetchMyResponses = (limit: number) =>
  client.callout.response.list(
    {
      sort: 'createdAt',
      order: 'DESC',
      limit,
      rules: {
        condition: 'AND',
        rules: [{ field: 'contact', operator: 'equal', value: ['me'] }],
      },
    },
    [GetCalloutResponseWith.Callout]
  );

export const latestResponsesQuery = queryOptions({
  queryKey: ['callouts', 'responses', 'me', 'latest'],
  queryFn: () => fetchMyResponses(3),
});
