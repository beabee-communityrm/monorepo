import { ApiError } from '@beabee/client';

import { useToast } from '@nuxt/ui/composables';
import { QueryCache, QueryClient } from '@tanstack/vue-query';
import { type App, watch } from 'vue';

import { LOADING } from '#constants/loading';
import { currentUser } from '#store/currentUser';

let showErrorToast: ((title: string) => void) | undefined;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.errorToast) showErrorToast?.(query.meta.errorToast);
    },
  }),
  defaultOptions: {
    queries: {
      // Also stops a page's components fetching again what its route guard
      // just fetched
      staleTime: LOADING.fresh,
      // One retry, unless the API answered, as its answer would come back the
      // same. A dropped connection or the API restarting gets one.
      retry: (failureCount, error) =>
        failureCount < 1 && !(error instanceof ApiError),
      retryDelay: LOADING.retryDelay,
      // The route guard fetches again on the next visit
      retryOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Shows a toast when a query that names one in `meta.errorToast` fails. Needs
 * the app, as Nuxt UI's toasts read from it.
 */
export function toastQueryErrors(app: App): void {
  const toast = app.runWithContext(() => useToast());
  showErrorToast = (title) =>
    toast.add({ title, color: 'error', icon: 'i-lucide-circle-alert' });
}

/** Empties the cache whenever the logged-in user changes, as cached data
 * belongs to whoever was logged in when it loaded */
export function clearCacheOnUserChange(): void {
  watch(
    () => currentUser.value?.id,
    () => queryClient.clear(),
    { flush: 'sync' }
  );
}
