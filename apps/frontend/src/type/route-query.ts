import type { QueryKey } from '@tanstack/vue-query';
import type { RouteLocationNormalized } from 'vue-router';

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
