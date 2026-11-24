/**
 * The frontend's side of the dev panel's interface. Everything here does
 * nothing unless the panel is on, and production builds compile it away.
 */
import type { DevPanelHooks } from '@beabee/dev-panel';

import { type QueryKey, hashKey } from '@tanstack/vue-query';
import { getCurrentInstance, ref } from 'vue';

/** The key of the page's layout, which the dev panel bumps to remount it */
export const pageKey = ref(0);

const panel = () =>
  import.meta.env.DEV ? window.__BEABEE_DEV_PANEL__ : undefined;

/** Starts the dev panel, if it's on. Call before the router starts. */
export function connectDevPanel(hooks: Omit<DevPanelHooks, 'remount'>) {
  panel()?.connect({ ...hooks, remount: () => pageKey.value++ });
}

/** Tells the dev panel the current component reads a query */
export function trackQueryReader(queryKey: QueryKey) {
  const devPanel = panel();
  const file = getCurrentInstance()?.type.__file;
  if (devPanel && file) devPanel.readQuery(hashKey(queryKey), file);
}

/** Tells the dev panel the requests made from now are a query's, until it's
 * called again without one */
export function markStartingQuery(queryKey?: QueryKey) {
  panel()?.startingQuery(queryKey && hashKey(queryKey));
}
