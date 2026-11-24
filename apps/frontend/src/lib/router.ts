import { createRouter, createWebHistory } from 'vue-router';
import { handleHotUpdate, routes } from 'vue-router/auto-routes';

import { LOADING } from '#lib/loading';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from) {
    if (from && to.name === from.name) return;
    // The dashboard layout scrolls its main element rather than the window
    document.getElementById('top')?.scrollTo({ top: 0 });
    return { top: 0 };
  },
});

// A navigation's loads start once its guards have run and its page's code has
// loaded, so neither uses up the time the page waits for its data
let loadStart = 0;
let shownLoadStart = 0;
router.beforeResolve(() => {
  loadStart = performance.now();
});
router.afterEach((to, from, failure) => {
  if (!failure) shownLoadStart = loadStart;
});

/**
 * When the loads of the navigation that showed the current page started, as a
 * `performance.now()` time. A navigation still under way doesn't count.
 */
export const getLoadStart = () => shownLoadStart;

const holds = new Set<Promise<unknown>>();

/**
 * Keeps the current page up while a request runs, for up to `LOADING.hold`,
 * so a quick one arrives with the page rather than after it.
 * Returns the request.
 */
export function holdNavigation<T>(load: Promise<T>) {
  holds.add(load);
  load.finally(() => holds.delete(load)).catch(() => {});
  return load;
}

/** Waits for held loads, until `LOADING.hold` after they started. Runs after
 * the route queries have started. */
export async function waitForHolds() {
  const remaining = LOADING.hold - (performance.now() - loadStart);
  if (!holds.size || remaining <= 0) return;
  await Promise.race([
    Promise.allSettled(holds),
    new Promise((resolve) => setTimeout(resolve, remaining)),
  ]);
}

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
  handleHotUpdate(router);
}

export default router;
