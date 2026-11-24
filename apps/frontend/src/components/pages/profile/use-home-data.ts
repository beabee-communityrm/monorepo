import {
  ContributionType,
  GetCalloutResponseWith,
  ItemStatus,
  MembershipStatus,
  PaymentStatus,
} from '@beabee/beabee-common';

import type { RouteQueries } from '#lib/query';
import { generalContent } from '#store';
import { client } from '#utils/api';

// The home page cards' queries. The home page exports them as `routeQueries`,
// and each card reads its own, so a slow card doesn't hold up the rest.

/** The open CrowdNewsrooms, newest first */
export const homeCalloutsQuery = {
  queryKey: ['home', 'callouts'],
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
};

/** The member's latest responses, with their CrowdNewsrooms */
export const fetchHomeResponses = (limit: number) =>
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

export const homeResponsesQuery = {
  queryKey: ['home', 'responses'],
  queryFn: () => fetchHomeResponses(3),
};

/** The newsletter groups the member can join or leave */
export const homeNewslettersQuery = {
  queryKey: ['home', 'newsletters'],
  queryFn: () => client.contact.newsletter.getGroups('me'),
};

const fetchLastPayment = async () => {
  const payments = await client.contact.payment.list('me', {
    sort: 'chargeDate',
    order: 'DESC',
    limit: 1,
    rules: {
      condition: 'AND',
      rules: [
        {
          field: 'status',
          operator: 'equal',
          value: [PaymentStatus.Successful],
        },
      ],
    },
  });
  return payments.items[0] ?? null;
};

/**
 * The member's contribution, and for the states that show it their most
 * recent successful payment. If the payment fails to load, it's left out.
 */
export const homeContributionQuery = {
  queryKey: ['home', 'contribution'],
  queryFn: async () => {
    const info = await client.contact.contribution.get();

    const hasCurrentContribution =
      info.membershipStatus === MembershipStatus.Expiring ||
      (info.membershipStatus === MembershipStatus.Active &&
        info.type !== ContributionType.None);
    const lastPayment = hasCurrentContribution
      ? null
      : await fetchLastPayment().catch(() => null);

    return { info, lastPayment };
  },
};

export const homeQueries: RouteQueries = () => [
  homeCalloutsQuery,
  homeResponsesQuery,
  homeNewslettersQuery,
  ...(generalContent.value.hideContribution ? [] : [homeContributionQuery]),
];
