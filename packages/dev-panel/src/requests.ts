/**
 * The panel's overrides for API requests. MSW answers them from a service
 * worker, so the frontend calls the real `fetch` and only the answer changes.
 */
import { ApiErrorCode } from '@beabee/beabee-common';

import { HttpResponse, bypass, http, passthrough } from 'msw';
import { setupWorker } from 'msw/browser';
import { reactive, watch } from 'vue';
import type { Router } from 'vue-router';

import type { DevQueryHeader } from './index';
import type { DevRequestHold, DevRequestMode } from './types';

const QUERY_HEADER: DevQueryHeader = 'X-Beabee-Dev-Query';

const STORAGE_KEY = 'beabee-dev-requests';

const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');

export const devRequests = reactive({
  /** Requests made on the current page, as "METHOD /path?query" */
  seen: [] as string[],
  /** Requests set to anything other than normal */
  modes: (stored.modes ?? {}) as Record<string, DevRequestMode>,
  /** The least time every request takes, in milliseconds */
  minDuration: (stored.minDuration ?? 0) as number,
  /** Requests seen to return a list, which can be forced empty */
  listKeys: (stored.listKeys ?? []) as string[],
  /** Requests made before the first page loaded, left out of "all" */
  appKeys: [] as string[],
  /** Requests held by Alt-clicks, oldest first */
  holds: [] as DevRequestHold[],
});

watch(
  () => ({
    modes: devRequests.modes,
    minDuration: devRequests.minDuration,
    listKeys: devRequests.listKeys,
  }),
  (value) => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
  { deep: true }
);

/** Resumes hanging requests, which then check their mode again */
const hanging = new Set<() => void>();
watch(
  () => devRequests.modes,
  () => {
    for (const resume of hanging) resume();
    hanging.clear();
  },
  { deep: true }
);

const emptyBody = (data: unknown) => {
  if (Array.isArray(data)) return [];
  if (
    data &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray(data.items)
  ) {
    return { items: [], total: 0, offset: 0, count: 0 };
  }
};

/** The hashed key of the query that made each request, if one did */
const queryOf = new Map<string, string>();

/** The component files that read each query */
const readers = new Map<string, Set<string>>();

export function readQuery(hash: string, file: string) {
  const files = readers.get(hash) ?? new Set<string>();
  files.add(file);
  readers.set(hash, files);
}

/** The files of the components that read the query that made a request */
export function sourcesOf(key: string) {
  const query = queryOf.get(key);
  return query ? [...(readers.get(query) ?? [])] : [];
}

const dropHold = (hold: DevRequestHold) => {
  const index = devRequests.holds.indexOf(hold);
  if (index >= 0) devRequests.holds.splice(index, 1);
};

/** Startup lasts until the first navigation is past its guards */
let booting = true;

/** Ends startup at the first navigation, and clears the list on each page */
export function watchNavigation(router: Router) {
  router.beforeEach((to, from) => {
    if (from.matched.length && to.path !== from.path) devRequests.seen = [];
  });

  const stopBooting = () => {
    booting = false;
    removers.forEach((remove) => remove());
  };
  const removers = [
    router.beforeResolve(stopBooting),
    router.afterEach(stopBooting),
  ];
}

/**
 * Starts the service worker that applies the panel's modes to API requests
 *
 * @param apiPath The path API requests start with, like "/api/1.0/"
 */
export async function startWorker(apiPath: string) {
  /** The latest Alt-click's hold, while it still takes new requests */
  let openHold:
    | { hold: DevRequestHold; resumes: ((mode: DevRequestMode) => void)[] }
    | undefined;
  let holdCount = 0;

  document.addEventListener(
    'click',
    (event) => {
      if (
        !event.altKey ||
        !(event.target instanceof Element) ||
        event.target.closest('[data-dev-bar]')
      ) {
        return;
      }

      const rect = event.target.getBoundingClientRect();
      const resumes: ((mode: DevRequestMode) => void)[] = [];
      const hold: DevRequestHold = reactive({
        id: ++holdCount,
        keys: [],
        top: rect.bottom + 120 < innerHeight ? rect.bottom + 8 : rect.top - 112,
        left: Math.max(16, Math.min(rect.left, innerWidth - 336)),
        settle: (mode) => {
          for (const resume of resumes) resume(mode);
          dropHold(hold);
        },
      });
      devRequests.holds.push(hold);
      openHold = { hold, resumes };

      setTimeout(() => {
        if (openHold?.hold === hold) openHold = undefined;
        if (!hold.keys.length) dropHold(hold);
      }, 500);
    },
    true
  );

  const worker = setupWorker(
    http.all(`${apiPath}*`, async ({ request }) => {
      const url = new URL(request.url);
      const path = url.pathname.slice(apiPath.length).replace(/\/+$/, '');
      // Only the API client's requests, which it marks, not images and other
      // files the page loads from the API
      if (
        path === 'health' ||
        request.headers.get('X-Requested-With') !== 'XMLHttpRequest'
      ) {
        return passthrough();
      }

      const key = `${request.method} /${path}${url.search}`;
      const query = request.headers.get(QUERY_HEADER);

      const minimum =
        devRequests.minDuration > 0
          ? new Promise((resume) => setTimeout(resume, devRequests.minDuration))
          : undefined;

      if (!devRequests.seen.includes(key)) devRequests.seen.push(key);
      if (query) queryOf.set(key, query);
      if (booting && !devRequests.appKeys.includes(key)) {
        devRequests.appKeys.push(key);
      }

      let mode: DevRequestMode | undefined;
      if (openHold) {
        const { hold, resumes } = openHold;
        hold.keys.push(key);
        mode = await new Promise((resume) => resumes.push(resume));
      } else {
        while (devRequests.modes[key] === 'hang') {
          await new Promise<void>((resume) => hanging.add(resume));
        }
        mode = devRequests.modes[key];
      }

      if (mode === 'fail') {
        await minimum;
        return HttpResponse.json(
          {
            httpCode: 500,
            code: ApiErrorCode.INTERNAL_SERVER_ERROR,
            message: `Forced by the dev panel: ${key}`,
          },
          { status: 500 }
        );
      }

      const forward = new Request(request);
      forward.headers.delete(QUERY_HEADER);
      const [response] = await Promise.all([fetch(bypass(forward)), minimum]);
      if (request.method !== 'GET' || !response.ok) return response;

      const empty = emptyBody(
        await response
          .clone()
          .json()
          .catch(() => null)
      );
      if (!empty) return response;

      if (!devRequests.listKeys.includes(key)) devRequests.listKeys.push(key);
      return mode === 'empty' ? HttpResponse.json(empty) : response;
    })
  );

  await worker.start({ quiet: true, onUnhandledFrame: 'bypass' });
}
