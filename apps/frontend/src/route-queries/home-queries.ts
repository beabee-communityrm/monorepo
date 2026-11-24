import { routeQuery } from '#lib/route-queries';
import {
  latestOpenCalloutsQuery,
  latestResponsesQuery,
} from '#queries/callouts';
import { contributionQuery, newsletterGroupsQuery } from '#queries/contact';
import { generalContent } from '#store';
import type { RouteQueries, RouteQuery } from '#type';

// For the responses card's "Show all", which fetches the full list itself
export { fetchMyResponses } from '#queries/callouts';

/**
 * The queries the home page's cards read. Each card reads its own, so a slow
 * card doesn't hold up the rest.
 */
export const homeQueries = {
  latestOpenCallouts: latestOpenCalloutsQuery,
  latestResponses: latestResponsesQuery,
  newsletterGroups: newsletterGroupsQuery,
  contribution: contributionQuery,
};

/** Starts the queries in `homeQueries`. Leaving one out is a type error. */
export const routeQueries: RouteQueries = () => {
  const starts: Record<keyof typeof homeQueries, RouteQuery | undefined> = {
    latestOpenCallouts: routeQuery(homeQueries.latestOpenCallouts),
    latestResponses: routeQuery(homeQueries.latestResponses),
    newsletterGroups: routeQuery(homeQueries.newsletterGroups),
    contribution: generalContent.value.hideContribution
      ? undefined
      : routeQuery(homeQueries.contribution),
  };
  return Object.values(starts).filter((start) => start !== undefined);
};
