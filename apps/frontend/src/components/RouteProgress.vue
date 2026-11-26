<!--
  # RouteProgress
  A thin bar across the top of the window while a page is loading, including
  the first one. It only appears if the navigation takes longer than a moment,
  so quick ones don't flicker, and once the site's theme has loaded, so it's
  never in the wrong colour. It glides towards 90% while the page loads,
  slowing as it goes, then fills quickly and fades out once it's there.
-->
<template>
  <Transition
    leave-active-class="transition-opacity duration-(--route-progress-fade) motion-reduce:transition-none"
    leave-to-class="opacity-0"
  >
    <UProgress
      v-if="shown"
      :model-value="value"
      size="xs"
      :get-value-label="() => t('common.loading')"
      class="fixed inset-x-0 top-0 z-100"
      :style="{
        '--route-progress-duration': `${filling ? LOADING.barFill : LOADING.barCreep}ms`,
        '--route-progress-fade': `${LOADING.barFade}ms`,
      }"
      :ui="{
        base: 'rounded-none bg-transparent',
        indicator: [
          'rounded-none duration-(--route-progress-duration) motion-reduce:transition-none',
          !filling && 'ease-[cubic-bezier(0.1,0.7,0.2,1)]',
        ],
      }"
    />
  </Transition>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  NavigationFailureType,
  isNavigationFailure,
  useRouter,
} from 'vue-router';

import { LOADING } from '#constants/loading';
import { generalContentLoaded } from '#store/generalContent';

const { t } = useI18n();
const router = useRouter();

const visible = ref(false);
const value = ref(0);
/** Whether the bar is filling, as the page has arrived */
const filling = ref(false);
/** Whether a page is loading, from the bar's start until it's done */
let running = false;
let timer: ReturnType<typeof setTimeout> | undefined;

const shown = computed(() => visible.value && generalContentLoaded.value);

// Once drawn at 10%, one long transition takes it towards 90%. The frame in
// between lets the browser draw the start before the transition begins.
watch(shown, (isShown) => {
  if (!isShown || filling.value) return;
  value.value = 10;
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (shown.value && !filling.value) value.value = 90;
    })
  );
});

function start() {
  clearTimeout(timer);
  running = true;
  filling.value = false;
  visible.value = false;
  timer = setTimeout(() => (visible.value = true), LOADING.barDelay);
}

function done() {
  clearTimeout(timer);
  running = false;
  if (!visible.value) return;
  filling.value = true;
  value.value = 100;
  timer = setTimeout(
    () => (visible.value = false),
    LOADING.barFill + LOADING.barFilled
  );
}

// The first navigation starts before the app mounts
start();

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
  clearTimeout(timer);
  removers.forEach((remove) => remove());
});
</script>
