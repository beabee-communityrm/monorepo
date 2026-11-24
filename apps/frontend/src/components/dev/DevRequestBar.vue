<!--
  # DevRequestBar
  Dev-only panel listing the API requests the current page has made, each with
  a mode to make it hang, fail or come back empty, and a minimum time for
  every request. Modes and the minimum apply from the next request and last
  for the browser tab's session. Changing a mode reruns the page, including
  its route loaders, or reloads it for app startup requests, and a hanging
  request carries on once its mode changes. Hovering a page request outlines
  the component that made it, or for a route loader's request, the components
  that read the loader. Alt-clicking anything on the page holds the requests
  the click makes, whatever their mode, until Succeed, Fail or Empty is picked
  for them.
-->
<template>
  <UPopover
    :content="{ side: 'top', align: 'start' }"
    :ui="{ content: 'dark [--ui-bg:black]' }"
    @update:open="(open) => open || highlight()"
  >
    <UButton
      icon="i-lucide-bug"
      color="neutral"
      :label="buttonLabel"
      :aria-label="buttonAriaLabel"
      class="fixed bottom-4 left-4 z-50"
      data-dev-bar
    />

    <template #content>
      <div
        class="flex w-xl max-w-[calc(100vw-2rem)] flex-col gap-5 p-5 text-default"
        data-dev-bar
      >
        <div class="flex flex-col gap-1">
          <h2 class="text-lg font-semibold">Simulate API responses</h2>
          <p class="text-sm text-muted">
            Alt-click a button on the page to hold the requests it makes.
          </p>
        </div>

        <label class="flex items-center gap-3 text-sm">
          Requests take at least
          <select
            v-model.number="devRequests.minDuration"
            class="cursor-pointer rounded-md bg-default px-2 py-1 ring ring-accented focus-visible:ring-2 focus-visible:ring-(--ui-color-neutral-500) focus-visible:outline-none"
          >
            <option v-for="ms in durations" :key="ms" :value="ms">
              {{ ms ? formatDuration(ms) : 'Off' }}
            </option>
          </select>
        </label>

        <p v-if="!keys.length" class="text-muted">No API requests yet.</p>

        <section v-if="pageKeys.length">
          <div
            class="flex items-center justify-between gap-3 border-b border-default pb-2"
          >
            <h3 class="text-sm font-semibold text-toned">Page requests</h3>
            <div
              class="flex shrink-0 divide-x divide-default overflow-hidden rounded-md ring ring-accented"
            >
              <button
                v-for="item in modeItems"
                :key="item.value"
                type="button"
                :aria-label="`Set all page requests to ${item.label}`"
                class="w-14 cursor-pointer py-1 text-xs text-muted hover:bg-elevated focus-visible:ring-2 focus-visible:ring-(--ui-color-neutral-500) focus-visible:outline-none focus-visible:ring-inset"
                @click="setAll(item.value)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <ul class="mt-2 flex flex-col gap-2">
            <li
              v-for="key in pageKeys"
              :key="key"
              @mouseenter="highlight(key)"
              @mouseleave="highlight()"
              @focusin="highlight(key)"
              @focusout="highlight()"
            >
              <fieldset class="flex min-w-0 items-center justify-between gap-3">
                <legend
                  class="float-left flex min-w-0 items-baseline gap-2"
                  :title="key"
                >
                  <code class="shrink-0 text-sm">{{ pathLabel(key) }}</code>
                  <code
                    v-if="queryLabel(key)"
                    class="truncate text-xs text-muted"
                    >{{ queryLabel(key) }}</code
                  >
                </legend>
                <div
                  class="flex shrink-0 divide-x divide-default overflow-hidden rounded-md ring ring-accented"
                >
                  <label
                    v-for="item in modeItems"
                    :key="item.value"
                    class="w-14"
                  >
                    <input
                      type="radio"
                      class="peer sr-only"
                      :name="key"
                      :value="item.value"
                      :checked="modeOf(key) === item.value"
                      :disabled="!canUse(key, item.value)"
                      @change="choose(key, item.value)"
                    />
                    <span :class="segmentClass">
                      {{ item.label }}
                    </span>
                  </label>
                </div>
              </fieldset>
            </li>
          </ul>
        </section>

        <section v-if="appKeys.length">
          <h3
            class="border-b border-default pb-2 text-sm font-semibold text-toned"
          >
            App startup
          </h3>
          <ul class="mt-2 flex flex-col gap-2">
            <li v-for="key in appKeys" :key="key">
              <fieldset class="flex min-w-0 items-center justify-between gap-3">
                <legend
                  class="float-left flex min-w-0 items-baseline gap-2"
                  :title="key"
                >
                  <code class="shrink-0 text-sm">{{ pathLabel(key) }}</code>
                  <code
                    v-if="queryLabel(key)"
                    class="truncate text-xs text-muted"
                    >{{ queryLabel(key) }}</code
                  >
                </legend>
                <div
                  class="flex shrink-0 divide-x divide-default overflow-hidden rounded-md ring ring-accented"
                >
                  <label
                    v-for="item in modeItems"
                    :key="item.value"
                    class="w-14"
                  >
                    <input
                      type="radio"
                      class="peer sr-only"
                      :name="key"
                      :value="item.value"
                      :checked="modeOf(key) === item.value"
                      :disabled="!canUse(key, item.value)"
                      @change="choose(key, item.value)"
                    />
                    <span :class="segmentClass">
                      {{ item.label }}
                    </span>
                  </label>
                </div>
              </fieldset>
            </li>
          </ul>
        </section>

        <UButton
          label="Reset all"
          color="neutral"
          variant="outline"
          class="self-start"
          @click="resetAll"
        />
      </div>
    </template>
  </UPopover>

  <div
    v-for="hold in shownHolds"
    :key="hold.id"
    class="dark fixed z-50 flex w-80 flex-col gap-2 rounded-md bg-default p-3 text-sm text-default shadow-lg ring ring-default [--ui-bg:black]"
    :style="{ top: `${hold.top}px`, left: `${hold.left}px` }"
    data-dev-bar
  >
    <p>
      Holding
      <template v-for="(key, i) in hold.keys" :key="key">
        <template v-if="i">, </template>
        <code :title="key">{{ pathLabel(key) }}</code>
      </template>
    </p>
    <div class="flex gap-2">
      <UButton
        v-for="outcome in outcomes"
        :key="outcome.value"
        size="xs"
        color="neutral"
        variant="outline"
        :disabled="outcome.value === 'empty' && !canEmpty(hold)"
        :aria-keyshortcuts="outcome.shortcut"
        @click="hold.settle(outcome.value)"
      >
        {{ outcome.label }}
        <UKbd :value="outcome.shortcut.toUpperCase()" />
      </UButton>
    </div>
  </div>

  <div
    v-for="(box, i) in boxes"
    :key="i"
    class="pointer-events-none fixed z-40 rounded-md bg-black/10 ring-2 ring-black"
    :style="{
      top: `${box.top}px`,
      left: `${box.left}px`,
      width: `${box.width}px`,
      height: `${box.height}px`,
    }"
  />
</template>

<script lang="ts" setup>
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue';
import { useRouter } from 'vue-router';

import { componentBoxes } from '#utils/dev/components';
import { queryClient } from '#lib/query';
import { forgetLoads } from '#lib/router';
import {
  devRequests,
  forgetLoadingLazyData,
  sourcesOf,
} from '#utils/dev/requests';
import type { DevRequestHold, DevRequestMode } from '#type';

const emit = defineEmits<{ (e: 'remount'): void }>();

const router = useRouter();

const keys = computed(() => [
  ...new Set([...devRequests.seen, ...Object.keys(devRequests.modes)]),
]);

const pageKeys = computed(() =>
  keys.value.filter((key) => !devRequests.appKeys.includes(key))
);

const appKeys = computed(() =>
  keys.value.filter((key) => devRequests.appKeys.includes(key))
);

const overrideCount = computed(() => Object.keys(devRequests.modes).length);

const formatDuration = (ms: number) =>
  ms < 1000 ? `${ms} ms` : `${ms / 1000} s`;

/** Shows what's in force, so a forgotten minimum or mode doesn't go unnoticed */
const buttonLabel = computed(
  () =>
    [
      overrideCount.value && String(overrideCount.value),
      devRequests.minDuration && formatDuration(devRequests.minDuration),
    ]
      .filter(Boolean)
      .join(' · ') || undefined
);

const buttonAriaLabel = computed(() =>
  [
    'Dev requests',
    overrideCount.value && `${overrideCount.value} overridden`,
    devRequests.minDuration &&
      `requests take at least ${formatDuration(devRequests.minDuration)}`,
  ]
    .filter(Boolean)
    .join(', ')
);

const modeItems = [
  { label: 'Normal', value: 'normal' as const },
  { label: 'Hang', value: 'hang' as const },
  { label: 'Error', value: 'fail' as const },
  { label: 'Empty', value: 'empty' as const },
];

/** Minimums to pick from: under the loading bar's 150 ms, between that and
 * the skeletons' 300 ms, just past it, and clearly slow */
const durations = [0, 100, 250, 400, 1000, 3000];

const splitKey = (key: string) => {
  const [base, query = ''] = key.split('?');
  return { base, params: new URLSearchParams(query) };
};

const pathLabel = (key: string) => splitKey(key).base.replace(/^GET /, '');

/** The query params that tell this request apart from others to the same path */
const queryLabel = (key: string) => {
  const { base, params } = splitKey(key);
  const others = keys.value
    .filter((other) => other !== key && splitKey(other).base === base)
    .map((other) => splitKey(other).params);
  return [...params]
    .filter(([name, value]) => others.some((p) => p.get(name) !== value))
    .map(([name, value]) => `${name}=${value}`)
    .join(' ');
};

const app = getCurrentInstance()?.appContext.app;
const boxes = ref<DOMRect[]>([]);

function highlight(key?: string) {
  boxes.value =
    app && key
      ? sourcesOf(key).flatMap((file) => componentBoxes(app, file))
      : [];
}

const shownHolds = computed(() =>
  devRequests.holds.filter((hold) => hold.keys.length)
);

const outcomes = [
  { label: 'Succeed', value: 'normal', shortcut: 's' },
  { label: 'Fail', value: 'fail', shortcut: 'f' },
  { label: 'Empty', value: 'empty', shortcut: 'e' },
] as const;

const canEmpty = (hold: DevRequestHold) =>
  hold.keys.every((key) => devRequests.listKeys.includes(key));

/** S, F or E settles the latest hold, unless typing in a field */
function onKeydown(event: KeyboardEvent) {
  const hold = shownHolds.value.at(-1);
  const outcome = outcomes.find((item) => item.shortcut === event.key);
  if (
    !hold ||
    !outcome ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    (outcome.value === 'empty' && !canEmpty(hold)) ||
    (event.target instanceof Element &&
      event.target.closest('input, textarea, select, [contenteditable]'))
  ) {
    return;
  }
  event.preventDefault();
  hold.settle(outcome.value);
}

onMounted(() => addEventListener('keydown', onKeydown));
onBeforeUnmount(() => removeEventListener('keydown', onKeydown));

const modeOf = (key: string) => devRequests.modes[key] ?? 'normal';

const canUse = (key: string, mode: DevRequestMode) =>
  mode !== 'empty' || devRequests.listKeys.includes(key);

const segmentClass = [
  'block py-1 text-center text-xs peer-focus-visible:ring-2 peer-focus-visible:ring-(--ui-color-neutral-500) peer-focus-visible:ring-inset',
  'peer-disabled:cursor-not-allowed peer-disabled:opacity-40',
  'peer-checked:bg-inverted peer-checked:font-semibold peer-checked:text-inverted',
  'cursor-pointer text-muted peer-[:enabled:not(:checked)]:hover:bg-elevated',
];

function setMode(key: string, mode: DevRequestMode) {
  if (mode === 'normal') {
    delete devRequests.modes[key];
  } else {
    devRequests.modes[key] = mode;
  }
}

/**
 * Startup requests are only made again by a full reload. Otherwise the page
 * reruns as a first visit would: it navigates to itself, so route loaders and
 * queries run again and hold the navigation, then remounts with whatever has arrived.
 */
async function rerun(reload: boolean) {
  if (reload) {
    await nextTick();
    location.reload();
  } else {
    forgetLoads();
    queryClient.clear();
    const { path, query, hash } = router.currentRoute.value;
    await router.replace({ path, query, hash, force: true });
    forgetLoadingLazyData();
    emit('remount');
  }
}

function choose(key: string, mode: DevRequestMode) {
  setMode(key, mode);
  rerun(devRequests.appKeys.includes(key));
}

function setAll(mode: DevRequestMode) {
  for (const key of pageKeys.value) {
    if (canUse(key, mode)) setMode(key, mode);
  }
  rerun(false);
}

function resetAll() {
  const hadAppModes = Object.keys(devRequests.modes).some((key) =>
    devRequests.appKeys.includes(key)
  );
  devRequests.modes = {};
  rerun(hadAppModes);
}
</script>
