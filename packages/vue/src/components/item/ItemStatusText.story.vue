<script lang="ts" setup>
/**
 * ItemStatusText component stories showcasing advanced status display with time information.
 * Component now uses internal i18n for status text automatically.
 */
import { ItemStatus } from '@beabee/beabee-common';

import { reactive } from 'vue';

import ItemStatusText from './ItemStatusText.vue';

// State for interactive playground
const state = reactive({
  status: ItemStatus.Open,
  starts: null as Date | null,
  expires: new Date('2024-03-15T18:00:00'),
  circle: false,
  inline: false,
});

// Status options for controls and examples
const statusOptions = [
  { label: 'Draft', value: ItemStatus.Draft },
  { label: 'Scheduled', value: ItemStatus.Scheduled },
  { label: 'Open', value: ItemStatus.Open },
  { label: 'Ended', value: ItemStatus.Ended },
];

// Real-world scenarios for demonstrations
const eventScenarios = [
  {
    title: 'Upcoming Conference',
    status: ItemStatus.Scheduled,
    starts: new Date('2024-06-15T09:00:00'),
    expires: new Date('2024-06-17T18:00:00'),
  },
  {
    title: 'Registration Open',
    status: ItemStatus.Open,
    starts: new Date('2024-01-01T00:00:00'),
    expires: new Date('2024-03-01T23:59:59'),
  },
  {
    title: 'Survey Closed',
    status: ItemStatus.Ended,
    starts: new Date('2023-11-01T00:00:00'),
    expires: new Date('2023-12-01T23:59:59'),
  },
  {
    title: 'Draft Event',
    status: ItemStatus.Draft,
    starts: null,
    expires: null,
  },
];
</script>

<template>
  <Story title="Item/ItemStatusText">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <ItemStatusText
          :status="state.status"
          :starts="state.starts"
          :expires="state.expires"
          :circle="state.circle"
          :inline="state.inline"
        />
      </div>

      <template #controls>
        <HstSelect
          v-model="state.status"
          title="Status"
          :options="
            statusOptions.map((s) => ({ label: s.label, value: s.value }))
          "
        />
        <HstDate v-model="state.starts" title="Start Date" />
        <HstDate v-model="state.expires" title="End Date" />
        <HstCheckbox v-model="state.circle" title="Show Circle" />
        <HstCheckbox v-model="state.inline" title="Inline Layout" />
      </template>
    </Variant>

    <Variant title="Layout Comparison">
      <div class="flex flex-col gap-6">
        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Vertical (Default) Layout</h4>
          <ItemStatusText
            :status="ItemStatus.Open"
            :starts="new Date('2024-01-01T00:00:00')"
            :expires="new Date('2024-02-01T23:59:59')"
            circle
          />
        </div>

        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Horizontal (Inline) Layout</h4>
          <ItemStatusText
            :status="ItemStatus.Open"
            :starts="new Date('2024-01-01T00:00:00')"
            :expires="new Date('2024-02-01T23:59:59')"
            inline
            circle
          />
        </div>
      </div>
    </Variant>

    <Variant title="Real-World Scenarios">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div
          v-for="scenario in eventScenarios"
          :key="scenario.title"
          class="rounded border p-4"
        >
          <h4 class="mb-3 font-semibold">{{ scenario.title }}</h4>
          <div class="flex flex-col gap-3">
            <div class="bg-gray-50 rounded p-3">
              <span class="text-gray-600 mb-2 block text-sm"
                >Vertical Layout:</span
              >
              <ItemStatusText
                :status="scenario.status"
                :starts="scenario.starts"
                :expires="scenario.expires"
                circle
              />
            </div>
            <div class="bg-gray-50 rounded p-3">
              <span class="text-gray-600 mb-2 block text-sm"
                >Inline Layout:</span
              >
              <ItemStatusText
                :status="scenario.status"
                :starts="scenario.starts"
                :expires="scenario.expires"
                inline
                circle
              />
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Status States Overview">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          v-for="{ label, value } in statusOptions"
          :key="value"
          class="rounded border p-4"
        >
          <h4 class="mb-3 font-semibold">{{ label }} Status</h4>
          <ItemStatusText
            :status="value"
            :starts="
              value === ItemStatus.Scheduled
                ? new Date('2024-06-15T09:00:00')
                : null
            "
            :expires="
              value === ItemStatus.Open || value === ItemStatus.Ended
                ? new Date('2024-03-15T18:00:00')
                : null
            "
            circle
          />
        </div>
      </div>
    </Variant>

    <Variant title="Interactive Circle Toggle">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Without Circle</h4>
          <ItemStatusText
            :status="ItemStatus.Open"
            :starts="new Date('2024-01-01T00:00:00')"
            :expires="new Date('2024-02-01T23:59:59')"
            :circle="false"
          />
        </div>

        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">With Circle</h4>
          <ItemStatusText
            :status="ItemStatus.Open"
            :starts="new Date('2024-01-01T00:00:00')"
            :expires="new Date('2024-02-01T23:59:59')"
            :circle="true"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Date Variations">
      <div class="grid grid-cols-1 gap-4">
        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">
            Future Event (Scheduled with both dates)
          </h4>
          <ItemStatusText
            :status="ItemStatus.Scheduled"
            :starts="new Date('2024-06-15T09:00:00')"
            :expires="new Date('2024-06-17T18:00:00')"
            circle
          />
        </div>

        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">
            Active Event (Open with expiration)
          </h4>
          <ItemStatusText
            :status="ItemStatus.Open"
            :starts="new Date('2024-01-01T00:00:00')"
            :expires="new Date('2024-03-01T23:59:59')"
            circle
          />
        </div>

        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Completed Event (Ended)</h4>
          <ItemStatusText
            :status="ItemStatus.Ended"
            :starts="new Date('2023-11-01T00:00:00')"
            :expires="new Date('2023-12-01T23:59:59')"
            circle
          />
        </div>

        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Draft (No dates)</h4>
          <ItemStatusText :status="ItemStatus.Draft" circle />
        </div>
      </div>
    </Variant>
  </Story>
</template>
