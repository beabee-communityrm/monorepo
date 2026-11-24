import {
  type QueryKey,
  type UseQueryOptions,
  useQuery,
} from '@tanstack/vue-query';
import {
  type MaybeRefOrGetter,
  computed,
  readonly,
  ref,
  toValue,
  watch,
} from 'vue';

import { useDelayedSkeleton } from '#composables/useDelayedSkeleton';
import { queryClient } from '#lib/query';
import { getPageLoadStart } from '#lib/route-queries';

/**
 * A block's view of a route query, for a block that loads on its own. What
 * the last load gave, data or an error, stays up while a new load runs.
 * Without either, a skeleton shows until the load finishes. A retry rejects
 * if it fails again.
 *
 * @param options The query, from `queryOptions()`, or a getter for one whose
 *   key changes
 */
export function useLazyQuery<TQueryFnData, TQueryKey extends QueryKey>(
  options: MaybeRefOrGetter<
    UseQueryOptions<
      TQueryFnData,
      Error,
      TQueryFnData,
      TQueryFnData,
      TQueryKey
    > & {
      queryKey: TQueryKey;
    }
  >
) {
  // A route query the page started counts from when the page's loads did.
  // One the block starts itself counts from now.
  const startedAt =
    queryClient.isFetching({
      queryKey: toValue(options).queryKey,
      exact: true,
    }) > 0
      ? getPageLoadStart()
      : performance.now();
  const query = useQuery(options);

  /** Whether the last finished load failed. A query with no data goes back to
   * pending when it loads again, so this keeps the error up until it's done. */
  const failed = ref(query.isError.value);
  watch(query.status, (status) => {
    if (status !== 'pending') failed.value = status === 'error';
  });

  /** Whether to show a skeleton: whenever there's neither data nor an error */
  const skeleton = useDelayedSkeleton(
    computed(() => query.data.value === undefined && !failed.value),
    startedAt
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

  return { data, skeleton, failed: readonly(failed), retry };
}
