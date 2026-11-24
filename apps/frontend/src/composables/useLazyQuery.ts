import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';

import { useDelayedSkeleton } from '#composables/useDelayedSkeleton';
import { trackQueryReader } from '#lib/dev-panel';

/**
 * A block's view of a route query, for a block that loads on its own. What
 * the last load gave, data or an error, stays up while a new load runs.
 * Without either, a skeleton shows until the load finishes. A retry rejects
 * if it fails again.
 *
 * @param options The query, from `queryOptions()`
 */
export function useLazyQuery<TQueryFnData, TQueryKey extends QueryKey>(
  options: UseQueryOptions<
    TQueryFnData,
    Error,
    TQueryFnData,
    TQueryFnData,
    TQueryKey
  > & { queryKey: TQueryKey }
) {
  const query = useQuery(options);
  trackQueryReader(options.queryKey);

  /** Whether the last finished load failed. A query with no data goes back to
   * pending when it loads again, so this keeps the error up until it's done. */
  const failed = ref(query.isError.value);
  watch(query.status, (status) => {
    if (status !== 'pending') failed.value = status === 'error';
  });

  /** Whether to show a skeleton: whenever there's neither data nor an error */
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
