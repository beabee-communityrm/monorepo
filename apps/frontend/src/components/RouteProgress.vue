<!--
  # RouteProgress
  A thin bar across the top of the window while a page is loading, including
  the first one. It only appears if the navigation takes longer than a moment,
  so quick ones don't flicker. It creeps towards the end while the page loads,
  then fills and fades out once it's there.
-->
<template>
  <Transition
    leave-active-class="transition-opacity duration-200 motion-reduce:transition-none"
    leave-to-class="opacity-0"
  >
    <UProgress
      v-if="visible"
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
import { useRouter } from 'vue-router';

/** How long a navigation can take before the bar appears, in milliseconds */
const DELAY = 150;
/** How long the full bar stays before fading, in milliseconds */
const FILLED = 200;

const { t } = useI18n();
const router = useRouter();

const visible = ref(false);
const value = ref(0);
let timer: ReturnType<typeof setTimeout> | undefined;
let trickle: ReturnType<typeof setInterval> | undefined;

function stop() {
  clearTimeout(timer);
  clearInterval(trickle);
}

function start() {
  stop();
  visible.value = false;
  timer = setTimeout(() => {
    value.value = 10;
    visible.value = true;
    // Each step covers about a tenth of what's left, so it slows towards 90%
    trickle = setInterval(
      () => (value.value += Math.ceil((90 - value.value) / 10)),
      200
    );
  }, DELAY);
}

function done() {
  stop();
  if (!visible.value) return;
  value.value = 100;
  timer = setTimeout(() => (visible.value = false), FILLED);
}

// The first navigation starts before the app mounts
start();
router.isReady().then(done, done);

const removers = [
  router.beforeEach(() => start()),
  router.afterEach(done),
  router.onError(done),
];

onBeforeUnmount(() => {
  stop();
  removers.forEach((remove) => remove());
});
</script>
