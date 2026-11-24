<!--
  # RouteProgress
  A thin bar across the top of the window while a page is loading, including
  the first one. It only appears if the navigation takes longer than a moment,
  so quick ones don't flicker, and once the site's theme has loaded, so it's
  never in the wrong colour. It creeps towards the end while the page loads,
  then fills and fades out once it's there.
-->
<template>
  <Transition
    leave-active-class="transition-opacity duration-200 motion-reduce:transition-none"
    leave-to-class="opacity-0"
  >
    <UProgress
      v-if="visible && generalContentLoaded"
      :model-value="value"
      size="xs"
      :get-value-label="() => t('common.loading')"
      class="fixed inset-x-0 top-0 z-100"
      :ui="{
        base: 'rounded-none bg-transparent',
        indicator: 'rounded-none motion-reduce:transition-none',
      }"
    />
  </Transition>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  NavigationFailureType,
  isNavigationFailure,
  useRouter,
} from 'vue-router';

import { LOADING } from '#lib/loading';
import { generalContentLoaded } from '#store/generalContent';

const { t } = useI18n();
const router = useRouter();

const visible = ref(false);
const value = ref(0);
/** Whether a page is loading, from the bar's start until it's done */
let running = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let trickle: ReturnType<typeof setInterval> | undefined;

function stop() {
  clearTimeout(timer);
  clearInterval(trickle);
}

function start() {
  stop();
  running = true;
  visible.value = false;
  timer = setTimeout(() => {
    value.value = 10;
    visible.value = true;
    // Each step covers about a tenth of what's left, so it slows towards 90%
    trickle = setInterval(
      () => (value.value += Math.ceil((90 - value.value) / 10)),
      LOADING.barStep
    );
  }, LOADING.barDelay);
}

function done() {
  stop();
  running = false;
  if (!visible.value) return;
  value.value = 100;
  timer = setTimeout(() => (visible.value = false), LOADING.barFilled);
}

// The first navigation starts before the app mounts
start();
router.isReady().then(done, done);

const removers = [
  // Carries on rather than starting again, for the first navigation, which
  // reaches here after the bar has started, and for one that replaces another
  router.beforeEach(() => {
    if (!running) start();
  }),
  // A navigation replaced by a newer one isn't done, as that one is loading
  router.afterEach((to, from, failure) => {
    if (!isNavigationFailure(failure, NavigationFailureType.cancelled)) done();
  }),
  router.onError(done),
];

onBeforeUnmount(() => {
  stop();
  removers.forEach((remove) => remove());
});
</script>
