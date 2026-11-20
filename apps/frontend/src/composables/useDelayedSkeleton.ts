import { type Ref, onBeforeUnmount, ref, watch } from 'vue';

import { getNavigationStart } from '#lib/router';

/** How long a load can take before its skeleton appears, in milliseconds */
const DELAY = 300;
/** How long a skeleton stays once it's appeared, in milliseconds */
const MINIMUM = 400;

/**
 * Whether to show a skeleton for something that's loading. It only appears
 * once the load has taken 300 ms, so quick loads go straight to the content,
 * and then stays for at least 400 ms so it doesn't flash. A load already
 * under way when the component appears counts from the start of the
 * navigation.
 *
 * @param loading Whether the content is loading
 */
export function useDelayedSkeleton(loading: Ref<boolean>) {
  const visible = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let shownAt = 0;

  watch(
    loading,
    (isLoading, wasLoading) => {
      clearTimeout(timer);

      if (isLoading) {
        if (visible.value) return;
        const start =
          wasLoading === undefined ? getNavigationStart() : performance.now();
        timer = setTimeout(
          () => {
            visible.value = true;
            shownAt = performance.now();
          },
          Math.max(0, DELAY - (performance.now() - start))
        );
      } else if (visible.value) {
        timer = setTimeout(
          () => (visible.value = false),
          Math.max(0, MINIMUM - (performance.now() - shownAt))
        );
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => clearTimeout(timer));

  return visible;
}
