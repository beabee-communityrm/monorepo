import {
  ContributionType,
  MembershipStatus,
  PaymentStatus,
} from '@beabee/beabee-common';

import { queryOptions } from '@tanstack/vue-query';

import { client } from '#utils/api';

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
