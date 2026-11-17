<!--
  # DevRequestBar
  Dev-only panel listing the API requests the current page has made, each with
  a mode to make it hang, fail or come back empty. Modes apply from the next
  request and last for the browser tab's session.
-->
<template>
  <UPopover :content="{ side: 'top', align: 'start' }">
    <UButton
      icon="i-lucide-bug"
      color="neutral"
      :label="overrideCount ? String(overrideCount) : undefined"
      :aria-label="
        overrideCount
          ? `Dev requests, ${overrideCount} overridden`
          : 'Dev requests'
      "
      class="fixed bottom-4 left-4 z-50"
    />

    <template #content>
      <div class="flex w-xl max-w-[calc(100vw-2rem)] flex-col gap-5 p-5">
        <h2 class="text-lg font-semibold">Simulate API responses</h2>

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
                class="w-14 cursor-pointer py-1 text-xs text-muted hover:bg-elevated focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
                @click="setAll(item.value)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <ul class="mt-2 flex flex-col gap-2">
            <li v-for="key in pageKeys" :key="key">
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
                      @change="setMode(key, item.value)"
                    />
                    <span :class="segmentClass(item.value)">
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
                      @change="setMode(key, item.value)"
                    />
                    <span :class="segmentClass(item.value)">
                      {{ item.label }}
                    </span>
                  </label>
                </div>
              </fieldset>
            </li>
          </ul>
        </section>

        <div class="flex justify-between gap-2">
          <UButton
            label="Reset all"
            color="neutral"
            variant="outline"
            @click="devRequests.modes = {}"
          />
          <UButton
            label="Reload"
            icon="i-lucide-rotate-cw"
            @click="reloadPage"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import { devRequests } from '#utils/dev/requests';
import type { DevRequestMode } from '#type';

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

const modeItems = [
  { label: 'Normal', value: 'normal' as const },
  { label: 'Hang', value: 'hang' as const },
  { label: 'Error', value: 'fail' as const },
  { label: 'Empty', value: 'empty' as const },
];

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

const modeOf = (key: string) => devRequests.modes[key] ?? 'normal';

const canUse = (key: string, mode: DevRequestMode) =>
  mode !== 'empty' || devRequests.listKeys.includes(key);

const segmentClass = (mode: DevRequestMode) => [
  'block py-1 text-center text-xs peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-inset',
  'peer-disabled:cursor-not-allowed peer-disabled:opacity-40',
  'peer-checked:font-semibold peer-checked:text-inverted',
  mode === 'normal' ? 'peer-checked:bg-inverted' : 'peer-checked:bg-primary',
  'cursor-pointer text-muted peer-[:enabled:not(:checked)]:hover:bg-elevated',
];

function setMode(key: string, mode: DevRequestMode) {
  if (mode === 'normal') {
    delete devRequests.modes[key];
  } else {
    devRequests.modes[key] = mode;
  }
}

function setAll(mode: DevRequestMode) {
  for (const key of pageKeys.value) {
    if (canUse(key, mode)) setMode(key, mode);
  }
}

const reloadPage = () => location.reload();
</script>
