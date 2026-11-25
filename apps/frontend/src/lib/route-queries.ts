import {
  type FetchQueryOptions,
  type QueryKey,
  noop,
} from '@tanstack/vue-query';
import type { RouteLocationNormalized, Router } from 'vue-router';

import { LOADING } from '#lib/loading';
import { queryClient } from '#lib/query';

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
    prefetch: () => queryClient.query(options).then(noop, noop),
  };
}

// A navigation's loads start once its guards have run and its page's code has
// loaded, so neither uses up the time the page waits for its data
let loadStart = 0;
let shownLoadStart = 0;

/**
 * When the loads of the navigation that showed the current page started, as a
 * `performance.now()` time. A navigation still under way doesn't count.
 */
export const getPageLoadStart = () => shownLoadStart;

const holds = new Set<Promise<void>>();

/** Keeps the current page up while a load runs, for up to `LOADING.hold` */
function holdNavigation(load: Promise<void>) {
  holds.add(load);
  load.finally(() => holds.delete(load));
}

/** Waits for held loads, until `LOADING.hold` after they started */
async function waitForHolds() {
  const remaining = LOADING.hold - (performance.now() - loadStart);
  if (!holds.size || remaining <= 0) return;
  await Promise.race([
    Promise.allSettled(holds),
    new Promise((resolve) => setTimeout(resolve, remaining)),
  ]);
}

const hasRouteQueries = (mod: unknown): mod is { routeQueries: RouteQueries } =>
  typeof mod === 'object' && mod !== null && 'routeQueries' in mod;

/**
 * Starts the queries the matched pages export as `routeQueries`. Waits for
 * those marked to wait. Holds the navigation, for up to `LOADING.hold`, for
 * the others that have no data yet. Those with data show it while they
 * refresh.
 */
async function prefetchRouteQueries(to: RouteLocationNormalized) {
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

/** Starts each navigation's route queries, and holds it while they load */
export function installRouteQueries(router: Router) {
  router.beforeResolve((to) => {
    loadStart = performance.now();
    return prefetchRouteQueries(to);
  });
  // After the route queries have started
  router.beforeResolve(waitForHolds);
  router.afterEach((to, from, failure) => {
    if (!failure) shownLoadStart = loadStart;
  });
}
