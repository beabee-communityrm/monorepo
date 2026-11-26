import { type Ref, onBeforeUnmount, ref, watch } from 'vue';

import { LOADING } from '#constants/loading';

/**
 * Whether to show a skeleton for something that's loading. It only appears
 * once the load has taken `LOADING.hold`, so quick loads go straight to the
 * content, and then stays for at least `LOADING.skeletonMinimum` so it
 * doesn't flash.
 *
 * @param loading Whether the content is loading
 * @param startedAt When a load already under way when the component appears
 *   started, as a `performance.now()` time
 */
export function useDelayedSkeleton(
  loading: Ref<boolean>,
  startedAt = performance.now()
): Ref<boolean> {
  const visible = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let shownAt = 0;

  function show() {
    visible.value = true;
    shownAt = performance.now();
  }

  watch(
    loading,
    (isLoading, wasLoading) => {
      clearTimeout(timer);

      if (isLoading) {
        if (visible.value) return;
        const start = wasLoading === undefined ? startedAt : performance.now();
        const delay = LOADING.hold - (performance.now() - start);
        // Already past it, as when the page arrived after its hold
        if (delay <= 0) show();
        else timer = setTimeout(show, delay);
      } else if (visible.value) {
        timer = setTimeout(
          () => (visible.value = false),
          Math.max(0, LOADING.skeletonMinimum - (performance.now() - shownAt))
        );
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => clearTimeout(timer));

  return visible;
}
