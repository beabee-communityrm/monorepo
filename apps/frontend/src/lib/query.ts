import { QueryClient, type QueryKey, hashKey } from '@tanstack/vue-query';
import type { RouteLocationNormalized } from 'vue-router';

import { holdNavigation } from '#lib/router';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The route guard below fetches a page's queries on every visit, so its
      // components only read them
      refetchOnMount: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

/** A query a page fetches on each visit */
export interface RouteQuery {
  queryKey: QueryKey;
  queryFn: () => Promise<unknown>;
}

/** The queries a page fetches on each visit, exported as `routeQueries` */
export type RouteQueries = (to: RouteLocationNormalized) => RouteQuery[];

const hasRouteQueries = (mod: unknown): mod is { routeQueries: RouteQueries } =>
  typeof mod === 'object' && mod !== null && 'routeQueries' in mod;

let prefetching: string | undefined;

/** The hash of the query the route guard is starting, while it starts it.
 * For the dev bar. */
export const getPrefetchingQuery = () => prefetching;

/**
 * Starts the queries the matched pages export as `routeQueries`. A query
 * without data yet holds the navigation, for up to 300 ms, so a quick one
 * arrives with the page. One with data shows it while it refreshes.
 */
export function prefetchRouteQueries(to: RouteLocationNormalized) {
  for (const mod of to.matched.flatMap((record) =>
    Object.values(record.mods)
  )) {
    if (!hasRouteQueries(mod)) continue;

    for (const query of mod.routeQueries(to)) {
      const cached = queryClient.getQueryData(query.queryKey) !== undefined;
      prefetching = hashKey(query.queryKey);
      const load = queryClient.prefetchQuery(query);
      prefetching = undefined;
      if (!cached) holdNavigation(load);
    }
  }
}
