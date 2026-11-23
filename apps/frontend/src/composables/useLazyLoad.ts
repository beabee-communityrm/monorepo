import { computed } from 'vue';
import type { UseDataLoaderResult } from 'vue-router/experimental';

import { useDelayedSkeleton } from '#composables/useDelayedSkeleton';
import { trackLoaderReader } from '#utils/dev/loader-readers';

/**
 * A block's view of a lazy route loader, for a block that loads on its own.
 * What the last load gave, data or an error, stays up while a new load runs,
 * so a revisit shows the block straight away. Without either, a skeleton
 * shows until the load finishes. A retry rejects if it fails again.
 *
 * @param result What the loader's composable returns
 */
export function useLazyLoad<T>(result: UseDataLoaderResult<T | undefined>) {
  const { data, error, reload } = result;
  trackLoaderReader(data);

  /** Whether the last load failed */
  const failed = computed(() => !!error.value);

  /**
   * Whether to show a skeleton in place of the block's content: whenever it
   * has neither data nor an error, so it's never empty. The navigation's hold
   * keeps quick loads from showing one.
   */
  const skeleton = useDelayedSkeleton(
    computed(() => data.value === undefined && !failed.value)
  );

  /** The loaded data, held back while a skeleton is still showing */
  const loaded = computed(() =>
    skeleton.value || failed.value ? undefined : data.value
  );

  /** Loads the data again; rejects if it still fails */
  async function retry() {
    await reload();
    if (error.value) throw error.value;
  }

  return { data: loaded, skeleton, failed, retry };
}
