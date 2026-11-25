import { ApiError } from '@beabee/client';

import { QueryClient } from '@tanstack/vue-query';
import { watch } from 'vue';

import { LOADING } from '#lib/loading';
import { currentUser } from '#store/currentUser';

export const queryClient = new QueryClient({
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

// Cached data belongs to whoever was logged in when it loaded
watch(
  () => currentUser.value?.id,
  () => {
    queryClient.cancelQueries();
    queryClient.clear();
  },
  { flush: 'sync' }
);
