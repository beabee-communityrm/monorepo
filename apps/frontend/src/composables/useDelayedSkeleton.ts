import { type Ref, onBeforeUnmount, ref, watch } from 'vue';

import { LOADING } from '#lib/loading';
import { getLoadStart } from '#lib/router';

/**
 * Whether to show a skeleton for something that's loading. It only appears
 * once the load has taken `LOADING.hold`, so quick loads go straight to the
 * content, and then stays for at least `LOADING.skeletonMinimum` so it
 * doesn't flash. A load already
 * under way when the component appears counts from when the loads of the
 * navigation that showed the page started.
 *
 * @param loading Whether the content is loading
 */
export function useDelayedSkeleton(loading: Ref<boolean>) {
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
        const start =
          wasLoading === undefined ? getLoadStart() : performance.now();
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
