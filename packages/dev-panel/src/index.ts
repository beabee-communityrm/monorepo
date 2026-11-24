/**
 * The interface between the frontend and the dev panel. The frontend may only
 * import types from this package; the panel itself is added to the page by
 * the Vite plugin in `./vite`, on the dev server only.
 */
import type { QueryClient } from '@tanstack/vue-query';
import type { App } from 'vue';
import type { Router } from 'vue-router';

/** What the frontend gives the panel when it starts */
export interface DevPanelHooks {
  /** The Vue app, for finding the components to outline */
  app: App;
  /** For rerunning the page, and telling startup requests from the page's */
  router: Router;
  /** Cleared when the page reruns, so it loads as a first visit */
  queryClient: QueryClient;
  /** Remounts the page, so its components load again */
  remount: () => void;
}

/** The panel, as the frontend sees it on `window.__BEABEE_DEV_PANEL__` */
export interface DevPanel {
  /** Starts the panel. Call before the router starts the first navigation. */
  connect: (hooks: DevPanelHooks) => void;
  /**
   * Records a component as one that reads a query, so hovering the query's
   * requests outlines it
   *
   * @param queryHash The query's hashed key
   * @param file The component's source file
   */
  readQuery: (queryHash: string, file: string) => void;
  /**
   * Marks the requests made from now as the given query's, until it's called
   * again without one
   *
   * @param queryHash The query's hashed key
   */
  startingQuery: (queryHash?: string) => void;
}

declare global {
  interface Window {
    /** Set on the dev server, when the dev panel is turned on */
    __BEABEE_DEV_PANEL__?: DevPanel;
  }
}
