import { createRouter, createWebHistory } from 'vue-router';
import { handleHotUpdate, routes } from 'vue-router/auto-routes';

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from) {
    return from && to.name === from.name ? undefined : { top: 0 };
  },
});

let navigationStart = 0;
router.beforeEach(() => {
  navigationStart = performance.now();
});

/** When the latest navigation started, as a `performance.now()` time */
export const getNavigationStart = () => navigationStart;

/** How long a navigation waits for held loads, in milliseconds */
const HOLD = 300;

const holds = new Set<Promise<unknown>>();

/**
 * Keeps the current page up while a lazy loader's request runs, for up to
 * 300 ms of the navigation, so a quick one arrives with the page rather than
 * after it. Returns the request.
 */
export function holdNavigation<T>(load: Promise<T>) {
  holds.add(load);
  load.finally(() => holds.delete(load)).catch(() => {});
  return load;
}

/** Waits for held loads, until 300 ms into the navigation. Runs after the
 * route loaders have started. */
export async function waitForHolds() {
  const remaining = HOLD - (performance.now() - navigationStart);
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
