<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';

import { reactive } from 'vue';

import ItemStatusComponent from './ItemStatus.vue';

const state = reactive({
  status: ItemStatus.Open,
  statusText: 'Open',
  circle: false,
});

const statusOptions = [
  { label: 'Draft', value: ItemStatus.Draft, text: 'Draft' },
  { label: 'Scheduled', value: ItemStatus.Scheduled, text: 'Scheduled' },
  { label: 'Open', value: ItemStatus.Open, text: 'Open' },
  { label: 'Ended', value: ItemStatus.Ended, text: 'Ended' },
] as const;

// Sample status scenarios
const contentScenarios = [
  {
    title: 'Blog Article',
    items: [
      { status: ItemStatus.Draft, text: 'Draft' },
      { status: ItemStatus.Scheduled, text: 'Scheduled' },
      { status: ItemStatus.Open, text: 'Published' },
      { status: ItemStatus.Ended, text: 'Archived' },
    ],
  },
  {
    title: 'Event Registration',
    items: [
      { status: ItemStatus.Draft, text: 'Preparation' },
      { status: ItemStatus.Scheduled, text: 'Opening Soon' },
      { status: ItemStatus.Open, text: 'Registration Open' },
      { status: ItemStatus.Ended, text: 'Registration Closed' },
    ],
  },
  {
    title: 'Campaign',
    items: [
      { status: ItemStatus.Draft, text: 'Planning' },
      { status: ItemStatus.Scheduled, text: 'Launching Soon' },
      { status: ItemStatus.Open, text: 'Active Campaign' },
      { status: ItemStatus.Ended, text: 'Campaign Ended' },
    ],
  },
];
</script>

<template>
  <Story title="Item/ItemStatus">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <ItemStatusComponent
          :status="state.status"
          :status-text="state.statusText"
          :circle="state.circle"
        />
      </div>

      <template #controls>
        <HstSelect
          v-model="state.status"
          title="Status"
          :options="
            statusOptions.map((s) => ({ label: s.label, value: s.value }))
          "
          @update:model-value="
            state.statusText =
              statusOptions.find((s) => s.value === state.status)?.text ||
              'Unknown'
          "
        />
        <HstText v-model="state.statusText" title="Status Text" />
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
              <ItemStatusComponent
                :status="option.value"
                :status-text="option.text"
              />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm">With Circle:</span>
              <ItemStatusComponent
                :status="option.value"
                :status-text="option.text"
                circle
              />
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
              <ItemStatusComponent
                :status="item.status"
                :status-text="item.text"
                circle
              />
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Custom Status Text">
      <div class="flex flex-col gap-4">
        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Multilingual Examples</h4>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <span class="text-gray-600 mb-1 block text-sm">English:</span>
              <ItemStatusComponent
                :status="ItemStatus.Open"
                status-text="Active"
                circle
              />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm">German:</span>
              <ItemStatusComponent
                :status="ItemStatus.Open"
                status-text="Aktiv"
                circle
              />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm">French:</span>
              <ItemStatusComponent
                :status="ItemStatus.Open"
                status-text="Actif"
                circle
              />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm">Spanish:</span>
              <ItemStatusComponent
                :status="ItemStatus.Open"
                status-text="Activo"
                circle
              />
            </div>
          </div>
        </div>

        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Custom Business States</h4>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <span class="text-gray-600 mb-1 block text-sm"
                >Approval Process:</span
              >
              <ItemStatusComponent
                :status="ItemStatus.Draft"
                status-text="Pending Review"
                circle
              />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm"
                >Content Lifecycle:</span
              >
              <ItemStatusComponent
                :status="ItemStatus.Ended"
                status-text="Archived"
                circle
              />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm"
                >Event Status:</span
              >
              <ItemStatusComponent
                :status="ItemStatus.Scheduled"
                status-text="Upcoming"
                circle
              />
            </div>
            <div>
              <span class="text-gray-600 mb-1 block text-sm"
                >Registration:</span
              >
              <ItemStatusComponent
                :status="ItemStatus.Open"
                status-text="Accepting Submissions"
                circle
              />
            </div>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
