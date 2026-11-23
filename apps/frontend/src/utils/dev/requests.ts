/**
 * Dev-only overrides for API requests, used by `DevRequestBar`. Wraps
 * `globalThis.fetch`, which every `@beabee/client` request goes through.
 */
import { ApiErrorCode } from '@beabee/beabee-common';

import { reactive, watch } from 'vue';

import env from '#env';
import router from '#lib/router';
import type { DevRequestHold, DevRequestMode } from '#type';

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
  /** The component file that made each request, from its call stack */
  sources: {} as Record<string, string>,
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

const dropHold = (hold: DevRequestHold) => {
  const index = devRequests.holds.indexOf(hold);
  if (index >= 0) devRequests.holds.splice(index, 1);
};

export function installDevRequests() {
  const realFetch = globalThis.fetch.bind(globalThis);

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

  router.beforeEach((to, from) => {
    if (from.matched.length && to.path !== from.path) devRequests.seen = [];
  });

  // Startup ends once the first navigation is past its guards, before its
  // route loaders run, or when it's abandoned
  let booting = true;
  const stopBooting = () => {
    booting = false;
    removers.forEach((remove) => remove());
  };
  const removers = [
    router.beforeResolve(stopBooting),
    router.afterEach(stopBooting),
  ];

  globalThis.fetch = async (input, init) => {
    const url = new URL(
      input instanceof Request ? input.url : input,
      location.href
    );
    const method = (
      init?.method ?? (input instanceof Request ? input.method : 'GET')
    ).toUpperCase();
    const path = url.pathname.slice(env.apiUrl.length).replace(/\/+$/, '');
    const key = `${method} /${path}${url.search}`;

    if (!url.pathname.startsWith(env.apiUrl) || path === 'health') {
      return realFetch(input, init);
    }

    const source = new Error().stack?.match(
      /https?:\/\/[^/]+(?:\/@fs)?(\/[^?:\s]+\.vue)/
    )?.[1];

    // Leaves the caller's reactive effect first, or a watchEffect that fetches
    // would track this state and refetch whenever another request is made
    await Promise.resolve();

    // Counts from here, so the request's own time is part of it
    const minimum =
      devRequests.minDuration > 0
        ? new Promise((resume) => setTimeout(resume, devRequests.minDuration))
        : undefined;

    if (!devRequests.seen.includes(key)) devRequests.seen.push(key);
    if (source) devRequests.sources[key] = source;
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
      return Response.json(
        {
          httpCode: 500,
          code: ApiErrorCode.INTERNAL_SERVER_ERROR,
          message: `Forced by the dev bar: ${key}`,
        },
        { status: 500 }
      );
    }

    const [response] = await Promise.all([realFetch(input, init), minimum]);
    if (method !== 'GET' || !response.ok) return response;

    const empty = emptyBody(
      await response
        .clone()
        .json()
        .catch(() => null)
    );
    if (!empty) return response;

    if (!devRequests.listKeys.includes(key)) devRequests.listKeys.push(key);
    return mode === 'empty' ? Response.json(empty) : response;
  };
}
