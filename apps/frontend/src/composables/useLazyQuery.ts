import { hashKey, useQuery } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';

import { useDelayedSkeleton } from '#composables/useDelayedSkeleton';
import type { RouteQuery } from '#lib/query';
import { trackQueryReader } from '#utils/dev/loader-readers';

/**
 * A block's view of a route query, for a block that loads on its own. What
 * the last load gave, data or an error, stays up while a new load runs.
 * Without either, a skeleton shows until the load finishes. A retry rejects
 * if it fails again.
 *
 * @param options The query, as the page exports it in `routeQueries`
 */
export function useLazyQuery<T>(
  options: RouteQuery & { queryFn: () => Promise<T> }
) {
  const query = useQuery(options);
  trackQueryReader(hashKey(options.queryKey));

  /** Whether the last finished load failed. A load with no data before it
   * goes back to pending, so this keeps the error up until it finishes. */
  const failed = ref(query.isError.value);
  watch(query.status, (status) => {
    if (status !== 'pending') failed.value = status === 'error';
  });

  const skeleton = useDelayedSkeleton(
    computed(() => query.data.value === undefined && !failed.value)
  );

  /** The loaded data, held back while a skeleton is still showing */
  const data = computed(() =>
    skeleton.value || failed.value ? undefined : query.data.value
  );

  /** Loads the data again; rejects if it still fails */
  async function retry() {
    const result = await query.refetch();
    if (result.isError) throw result.error;
  }

  return { data, skeleton, failed, retry };
}
