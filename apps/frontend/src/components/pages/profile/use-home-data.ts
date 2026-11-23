import {
  ContributionType,
  GetCalloutResponseWith,
  ItemStatus,
  MembershipStatus,
  PaymentStatus,
} from '@beabee/beabee-common';

import { defineBasicLoader } from 'vue-router/experimental';

import { holdUntilLoaded } from '#lib/router';
import { generalContent } from '#store';
import { client } from '#utils/api';

// The home page cards' data. The home page exports these loaders, and each
// card reads its own. They're lazy, so a slow card doesn't hold up the rest,
// but the page waits up to 300 ms for them all, until each has loaded once.

/** The open CrowdNewsrooms, newest first */
export const useHomeCalloutsData = defineBasicLoader(
  () =>
    holdUntilLoaded(
      'callouts',
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
      )
    ),
  { lazy: true }
);

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

export const useHomeResponsesData = defineBasicLoader(
  () => holdUntilLoaded('responses', fetchHomeResponses(3)),
  { lazy: true }
);

/** The newsletter groups the member can join or leave */
export const useHomeNewslettersData = defineBasicLoader(
  () =>
    holdUntilLoaded('newsletters', client.contact.newsletter.getGroups('me')),
  { lazy: true }
);

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

export const useHomeContributionData = defineBasicLoader(
  () =>
    generalContent.value.hideContribution
      ? Promise.resolve(undefined)
      : holdUntilLoaded('contribution', loadContribution()),
  { lazy: true }
);
