/**
 * Dev-only overrides for API requests, used by `DevRequestBar`. Wraps
 * `globalThis.fetch`, which every `@beabee/client` request goes through.
 */
import { ApiErrorCode } from '@beabee/beabee-common';

import { reactive, watch } from 'vue';

import env from '#env';
import router from '#lib/router';
import type { DevRequestMode } from '#type';

const STORAGE_KEY = 'beabee-dev-requests';

const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');

export const devRequests = reactive({
  /** Requests made on the current page, as "METHOD /path?query" */
  seen: [] as string[],
  /** Requests set to anything other than normal */
  modes: (stored.modes ?? {}) as Record<string, DevRequestMode>,
  /** Requests seen to return a list, which can be forced empty */
  listKeys: (stored.listKeys ?? []) as string[],
  /** Requests made before the first page loaded, left out of "all" */
  appKeys: [] as string[],
});

watch(
  () => ({ modes: devRequests.modes, listKeys: devRequests.listKeys }),
  (value) => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value)),
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

export function installDevRequests() {
  const realFetch = globalThis.fetch.bind(globalThis);

  router.beforeEach((to, from) => {
    if (from.matched.length && to.path !== from.path) devRequests.seen = [];
  });

  let booting = true;
  const stopBooting = router.afterEach(() => {
    booting = false;
    stopBooting();
  });

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

    if (!devRequests.seen.includes(key)) devRequests.seen.push(key);
    if (booting && !devRequests.appKeys.includes(key)) {
      devRequests.appKeys.push(key);
    }

    const mode = devRequests.modes[key];
    if (mode === 'hang') return new Promise<Response>(() => {});
    if (mode === 'fail') {
      return Response.json(
        {
          httpCode: 500,
          code: ApiErrorCode.INTERNAL_SERVER_ERROR,
          message: `Forced by the dev bar: ${key}`,
        },
        { status: 500 }
      );
    }

    const response = await realFetch(input, init);
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
