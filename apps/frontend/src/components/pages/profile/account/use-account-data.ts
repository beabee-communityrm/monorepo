import { GetContactWith } from '@beabee/beabee-common';

import { queryOptions } from '@tanstack/vue-query';

import { routeQuery } from '#lib/route-queries';
import { newsletterGroupsQuery } from '#queries/contact';
import { generalContent } from '#store';
import type { RouteQueries } from '#type';
import { client } from '#utils/api';

export { newsletterGroupsQuery };

// The account page's queries. The page exports them as `routeQueries`, for
// the open tab only. They're lazy, so each card shows as soon as its own data
// arrives, and a card that fails doesn't stop the rest of the tab showing.

/** The join setup content, for the delivery address opt-in */
export const joinSetupContentQuery = queryOptions({
  queryKey: ['content', 'join/setup'],
  queryFn: () => client.content.get('join/setup'),
});

/** The join content, for whether to show the VAT number */
export const joinContentQuery = queryOptions({
  queryKey: ['content', 'join'],
  queryFn: () => client.content.get('join'),
});

/**
 * A contact with their profile
 *
 * @param contactId The contact's id, or "me"
 */
export const contactProfileQuery = (contactId: string) =>
  queryOptions({
    queryKey: ['contact', contactId, 'profile'],
    queryFn: () => client.contact.get(contactId, [GetContactWith.Profile]),
  });

/**
 * A contact's multi-factor authentication, or null without it
 *
 * @param contactId The contact's id, or "me"
 */
export const contactMfaQuery = (contactId: string) =>
  queryOptions({
    queryKey: ['contact', contactId, 'mfa'],
    queryFn: async () => (await client.contact.mfa.get(contactId)) ?? null,
  });

/** The member's login methods, on OIDC instances */
export const authMethodsQuery = queryOptions({
  queryKey: ['contact', 'me', 'auth-methods'],
  queryFn: () => client.contact.authMethod.list('me'),
});

/** The open tab's queries, from `?tab=` */
export const accountQueries: RouteQueries = (to) => {
  switch (to.query.tab?.toString()) {
    case 'security':
      return generalContent.value.oidcEnabled
        ? [routeQuery(authMethodsQuery)]
        : [
            routeQuery(contactProfileQuery('me')),
            routeQuery(contactMfaQuery('me')),
          ];
    case 'subscriptions':
      return [routeQuery(newsletterGroupsQuery)];
    default:
      return [
        routeQuery(joinSetupContentQuery),
        routeQuery(joinContentQuery),
        routeQuery(contactProfileQuery('me')),
      ];
  }
};
