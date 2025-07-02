<script lang="ts" setup>
/**
 * ItemStatus component stories showcasing status display with color-coded styling.
 * Component now uses internal i18n for status text automatically.
 */
import { ItemStatus } from '@beabee/beabee-common';

import { reactive } from 'vue';

import ItemStatusComponent from './ItemStatus.vue';

// State for interactive playground
const state = reactive({
  status: ItemStatus.Open,
  circle: false,
});

// Status options for controls and examples
const statusOptions = [
  { label: 'Draft', value: ItemStatus.Draft },
  { label: 'Scheduled', value: ItemStatus.Scheduled },
  { label: 'Open', value: ItemStatus.Open },
  { label: 'Ended', value: ItemStatus.Ended },
];

// Content scenarios for real-world examples
const contentScenarios = [
  {
    title: 'Blog Post',
    items: [
      { status: ItemStatus.Draft },
      { status: ItemStatus.Scheduled },
      { status: ItemStatus.Open },
      { status: ItemStatus.Ended },
    ],
  },
  {
    title: 'Event Registration',
    items: [
      { status: ItemStatus.Draft },
      { status: ItemStatus.Scheduled },
      { status: ItemStatus.Open },
      { status: ItemStatus.Ended },
    ],
  },
  {
    title: 'Campaign',
    items: [
      { status: ItemStatus.Draft },
      { status: ItemStatus.Scheduled },
      { status: ItemStatus.Open },
      { status: ItemStatus.Ended },
    ],
  },
];
</script>

<template>
  <Story title="Item/ItemStatus">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <ItemStatusComponent :status="state.status" :circle="state.circle" />
      </div>

      <template #controls>
        <HstSelect
          v-model="state.status"
          title="Status"
          :options="
            statusOptions.map((s) => ({ label: s.label, value: s.value }))
          "
        />
        <HstCheckbox v-model="state.circle" title="Show Circle" />
      </template>
    </Variant>

    <Variant title="All Status Types">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          v-for="option in statusOptions"
          :key="option.value"
          class="rounded border p-4"
        >
          <h4 class="mb-3 font-semibold">{{ option.label }}</h4>
          <div class="flex flex-col gap-2">
            <div>
              <span class="text-gray-600 mb-1 block text-sm"
                >Without Circle:</span
              >
              <ItemStatusComponent :status="option.value" />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm">With Circle:</span>
              <ItemStatusComponent :status="option.value" circle />
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Real-World Scenarios">
      <div class="flex flex-col gap-6">
        <div
          v-for="scenario in contentScenarios"
          :key="scenario.title"
          class="rounded border p-4"
        >
          <h4 class="mb-4 text-lg font-semibold">{{ scenario.title }}</h4>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div
              v-for="item in scenario.items"
              :key="item.status"
              class="bg-gray-50 rounded p-3"
            >
              <ItemStatusComponent :status="item.status" circle />
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="International Localization">
      <div class="flex flex-col gap-4">
        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Automatic i18n Translation</h4>
          <p class="text-gray-600 mb-4 text-sm">
            Status text is automatically translated using internal i18n keys
            (common.status.*). The examples below show the same component
            displaying different translations.
          </p>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <span class="text-gray-600 mb-1 block text-sm"
                >Standard Status Display:</span
              >
              <ItemStatusComponent :status="ItemStatus.Open" circle />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm"
                >With Circle Indicator:</span
              >
              <ItemStatusComponent :status="ItemStatus.Scheduled" circle />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm"
                >Draft Status:</span
              >
              <ItemStatusComponent :status="ItemStatus.Draft" circle />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm"
                >Ended Status:</span
              >
              <ItemStatusComponent :status="ItemStatus.Ended" circle />
            </div>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
