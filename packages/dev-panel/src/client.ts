/**
 * The panel's entry point, which the Vite plugin adds to the page ahead of the
 * frontend. It starts overriding requests straight away, so startup requests
 * are covered, and shows the panel once the frontend connects.
 */
import { h, render } from 'vue';

import DevPanel from './DevPanel.vue';
import type { DevPanelHooks } from './index';
import {
  installRequests,
  readQuery,
  setStartingQuery,
  watchNavigation,
} from './requests';

/**
 * Starts the panel
 *
 * @param apiPath The path API requests start with, like "/api/1.0/"
 */
export function start(apiPath: string) {
  installRequests(apiPath);

  window.__BEABEE_DEV_PANEL__ = {
    connect(hooks: DevPanelHooks) {
      watchNavigation(hooks.router);

      // Rendered with the frontend's app context, so it shares its Nuxt UI
      // setup, but outside its component tree. Waits for the first page, by
      // when the frontend has installed its plugins.
      hooks.router.isReady().then(() => {
        const container = document.createElement('div');
        document.body.append(container);
        const vnode = h(DevPanel, { hooks });
        vnode.appContext = hooks.app._context;
        render(vnode, container);
      });
    },
    readQuery,
    startingQuery: setStartingQuery,
  };
}
