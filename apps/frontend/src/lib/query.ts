import {
  type FetchQueryOptions,
  QueryClient,
  type QueryKey,
} from '@tanstack/vue-query';
import type { RouteLocationNormalized } from 'vue-router';

import { LOADING } from '#lib/loading';
import { holdNavigation } from '#lib/router';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Also stops a page's components fetching again what its route guard
      // just fetched
      staleTime: LOADING.fresh,
      // One retry for a request that got no answer at all, as when a
      // connection drops. An answer from the server, even an error, isn't
      // retried, as it would come back the same.
      retry: (failureCount, error) =>
        failureCount < 1 && error instanceof TypeError,
      retryDelay: LOADING.retryDelay,
      // The route guard fetches again on the next visit
      retryOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

/** A query a page starts on each visit, before the page shows */
export interface RouteQuery {
  queryKey: QueryKey;
  /** Whether the navigation waits for it, rather than for up to
   * `LOADING.hold` */
  wait: boolean;
  /** Fetches it unless it's fresh. Never rejects; a failure is kept in the
   * query. */
  prefetch: () => Promise<void>;
}

/** The queries a page starts on each visit, exported as `routeQueries` */
export type RouteQueries = (to: RouteLocationNormalized) => RouteQuery[];

/**
 * A query for a page's `routeQueries`
 *
 * @param options The query, from `queryOptions()`
 * @param wait Whether the navigation waits for it. For data that decides what
 *   the page offers. Otherwise it waits for up to `LOADING.hold`, the first
 *   time.
 */
export function routeQuery<TQueryFnData, TQueryKey extends QueryKey>(
  options: FetchQueryOptions<TQueryFnData, Error, TQueryFnData, TQueryKey>,
  { wait = false } = {}
): RouteQuery {
  return {
    queryKey: options.queryKey,
    wait,
    prefetch: () => queryClient.prefetchQuery(options),
  };
}

const hasRouteQueries = (mod: unknown): mod is { routeQueries: RouteQueries } =>
  typeof mod === 'object' && mod !== null && 'routeQueries' in mod;

/**
 * Starts the queries the matched pages export as `routeQueries`. Waits for
 * those marked to wait. Holds the navigation, for up to `LOADING.hold`, for
 * the others that have no data yet. Those with data show it while they
 * refresh.
 */
export async function prefetchRouteQueries(to: RouteLocationNormalized) {
  const waits: Promise<void>[] = [];

  for (const mod of to.matched.flatMap((record) =>
    Object.values(record.mods)
  )) {
    if (!hasRouteQueries(mod)) continue;

    for (const query of mod.routeQueries(to)) {
      const cached = queryClient.getQueryData(query.queryKey) !== undefined;
      const load = query.prefetch();
      if (query.wait) waits.push(load);
      else if (!cached) holdNavigation(load);
    }
  }

  await Promise.all(waits);
}
