import {
  ContributionType,
  GetCalloutResponseWith,
  ItemStatus,
  MembershipStatus,
  PaymentStatus,
} from '@beabee/beabee-common';

import { queryOptions } from '@tanstack/vue-query';

import { routeQuery } from '#lib/route-queries';
import { generalContent } from '#store';
import type { RouteQueries, RouteQuery } from '#type';
import { client } from '#utils/api';

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

/** The newsletter groups the member can join or leave */
export const newsletterGroupsQuery = queryOptions({
  queryKey: ['contact', 'me', 'newsletter-groups'],
  queryFn: () => client.contact.newsletter.getGroups('me'),
});

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
const loadContribution = async () => {
  const info = await client.contact.contribution.get();

  const hasCurrentContribution =
    info.membershipStatus === MembershipStatus.Expiring ||
    (info.membershipStatus === MembershipStatus.Active &&
      info.type !== ContributionType.None);
  const lastPayment = hasCurrentContribution
    ? null
    : await fetchLastPayment().catch(() => null);

  return { info, lastPayment };
};

export const contributionQuery = queryOptions({
  queryKey: ['contact', 'me', 'contribution'],
  queryFn: loadContribution,
});

/**
 * The queries the home page's cards read. Each card reads its own, so a slow
 * card doesn't hold up the rest.
 */
export const homeQueries = {
  openCallouts: openCalloutsQuery,
  latestResponses: latestResponsesQuery,
  newsletterGroups: newsletterGroupsQuery,
  contribution: contributionQuery,
};

/** Starts the queries in `homeQueries`. Leaving one out is a type error. */
export const routeQueries: RouteQueries = () => {
  const starts: Record<keyof typeof homeQueries, RouteQuery | undefined> = {
    openCallouts: routeQuery(homeQueries.openCallouts),
    latestResponses: routeQuery(homeQueries.latestResponses),
    newsletterGroups: routeQuery(homeQueries.newsletterGroups),
    contribution: generalContent.value.hideContribution
      ? undefined
      : routeQuery(homeQueries.contribution),
  };
  return Object.values(starts).filter((start) => start !== undefined);
};
