/**
 * The frontend's side of the dev panel's interface. Everything here does
 * nothing unless the panel is on, and production builds compile it away.
 */
import type { DevPanelHooks, DevQueryHeader } from '@beabee/dev-panel';

import { type QueryKey, hashKey } from '@tanstack/vue-query';
import {
  type MaybeRefOrGetter,
  getCurrentInstance,
  ref,
  toValue,
  watchEffect,
} from 'vue';

/** The key of the page's layout, which the dev panel bumps to remount it */
export const pageKey = ref(0);

const panel = () =>
  import.meta.env.DEV ? window.__BEABEE_DEV_PANEL__ : undefined;

/** Starts the dev panel, if it's on. Call before the router starts. */
export function connectDevPanel(hooks: Omit<DevPanelHooks, 'remount'>) {
  panel()?.connect({ ...hooks, remount: () => pageKey.value++ });
}

/** Tells the dev panel the current component reads a query, whose key can
 * change */
export function trackQueryReader(queryKey: MaybeRefOrGetter<QueryKey>) {
  const devPanel = panel();
  const file = getCurrentInstance()?.type.__file;
  if (devPanel && file) {
    watchEffect(() => devPanel.readQuery(hashKey(toValue(queryKey)), file));
  }
}

/** Waits for the dev panel to see requests, if it's on */
export const devPanelReady = () => panel()?.ready;

let clientHeaders: Record<string, string> | undefined;

/** Lets the dev panel tag the API client's requests, if it's on. The client
 * reads its headers object on each request. */
export function tagClientRequests(headers: Record<string, string>) {
  if (panel()) clientHeaders = headers;
}

/** Tags the requests made from now with a query, for the dev panel, until
 * it's called again without one */
export function markStartingQuery(queryKey?: QueryKey) {
  if (!clientHeaders) return;
  const header: DevQueryHeader = 'X-Beabee-Dev-Query';
  if (queryKey) clientHeaders[header] = hashKey(queryKey);
  else delete clientHeaders[header];
}
