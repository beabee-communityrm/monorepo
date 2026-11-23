import { computed, ref } from 'vue';
import type { UseDataLoaderResult } from 'vue-router/experimental';

import { useDelayedSkeleton } from '#composables/useDelayedSkeleton';

/**
 * A block's view of a lazy route loader, for a block that loads on its own.
 * Data from an earlier visit shows straight away while it refreshes. Without
 * any, a skeleton shows if the load is slow. The error stays up while a retry
 * runs, and the retry rejects if it fails again.
 *
 * @param result What the loader's composable returns
 */
export function useLazyLoad<T>(result: UseDataLoaderResult<T | undefined>) {
  const { data, error, isLoading, reload } = result;

  const retrying = ref(false);

  /** Loading on the way into the page, which a retry isn't */
  const loading = computed(() => isLoading.value && !retrying.value);

  /** Whether to show a skeleton in place of the block's content */
  const skeleton = useDelayedSkeleton(
    computed(() => loading.value && data.value === undefined)
  );

  /** Whether the latest load failed, hidden while a fresh one runs */
  const failed = computed(() => !!error.value && !loading.value);

  /** The loaded data, held back while a skeleton is still showing */
  const loaded = computed(() =>
    skeleton.value || failed.value ? undefined : data.value
  );

  /** Loads the data again; rejects if it still fails */
  async function retry() {
    retrying.value = true;
    try {
      await reload();
      if (error.value) throw error.value;
    } finally {
      retrying.value = false;
    }
  }

  return { data: loaded, skeleton, failed, retry };
}
