<script lang="ts" setup>
import { reactive } from 'vue';

import ItemDateRange from './ItemDateRange.vue';

const state = reactive({
  starts: new Date('2024-01-15T10:00:00'),
  expires: new Date('2024-03-15T18:00:00'),
  dateFormat: 'PP',
  separator: ' - ',
  showIcon: true,
});

const dateFormats = [
  { label: 'Medium (PP)', value: 'PP' },
  { label: 'Long (PPP)', value: 'PPP' },
  { label: 'Full (PPPP)', value: 'PPPP' },
  { label: 'Short (P)', value: 'P' },
  { label: 'Custom (dd.MM.yyyy)', value: 'dd.MM.yyyy' },
] as const;

// Sample dates for different scenarios
const eventDates = {
  upcoming: new Date('2024-12-25T09:00:00'),
  current: new Date('2024-01-15T10:00:00'),
  past: new Date('2023-06-15T14:00:00'),
};
</script>

<template>
  <Story title="Item/ItemDateRange">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <ItemDateRange
          :starts="state.starts"
          :expires="state.expires"
          :date-format="state.dateFormat"
          :separator="state.separator"
          :show-icon="state.showIcon"
        />
      </div>

      <template #controls>
        <HstDate v-model="state.starts" title="Start Date" />
        <HstDate v-model="state.expires" title="End Date" />
        <HstSelect
          v-model="state.dateFormat"
          title="Date Format"
          :options="
            dateFormats.map((f) => ({ label: f.label, value: f.value }))
          "
        />
        <HstText v-model="state.separator" title="Separator" />
        <HstCheckbox v-model="state.showIcon" title="Show Icon" />
      </template>
    </Variant>

    <Variant title="Date Formats">
      <div class="flex flex-col gap-4">
        <div
          v-for="format in dateFormats"
          :key="format.value"
          class="rounded border p-3"
        >
          <h4 class="mb-2 font-semibold">{{ format.label }}</h4>
          <ItemDateRange
            :starts="new Date('2024-01-15T10:00:00')"
            :expires="new Date('2024-03-15T18:00:00')"
            :date-format="format.value"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Event Scenarios">
      <div class="flex flex-col gap-4">
        <div class="rounded border p-3">
          <h4 class="mb-2 font-semibold">Upcoming Event</h4>
          <ItemDateRange
            :starts="eventDates.upcoming"
            :expires="new Date('2024-12-31T23:59:59')"
          />
        </div>

        <div class="rounded border p-3">
          <h4 class="mb-2 font-semibold">Current Event</h4>
          <ItemDateRange
            :starts="eventDates.current"
            :expires="new Date('2024-06-15T18:00:00')"
          />
        </div>

        <div class="rounded border p-3">
          <h4 class="mb-2 font-semibold">Past Event</h4>
          <ItemDateRange
            :starts="eventDates.past"
            :expires="new Date('2023-08-15T17:00:00')"
          />
        </div>

        <div class="rounded border p-3">
          <h4 class="mb-2 font-semibold">Single Date (No End)</h4>
          <ItemDateRange :starts="eventDates.current" />
        </div>
      </div>
    </Variant>

    <Variant title="Customization Options">
      <div class="flex flex-col gap-4">
        <div class="rounded border p-3">
          <h4 class="mb-2 font-semibold">Without Icon</h4>
          <ItemDateRange
            :starts="new Date('2024-01-15T10:00:00')"
            :expires="new Date('2024-03-15T18:00:00')"
            :show-icon="false"
          />
        </div>

        <div class="rounded border p-3">
          <h4 class="mb-2 font-semibold">Custom Separator</h4>
          <ItemDateRange
            :starts="new Date('2024-01-15T10:00:00')"
            :expires="new Date('2024-03-15T18:00:00')"
            separator=" → "
          />
        </div>

        <div class="rounded border p-3">
          <h4 class="mb-2 font-semibold">Long Separator</h4>
          <ItemDateRange
            :starts="new Date('2024-01-15T10:00:00')"
            :expires="new Date('2024-03-15T18:00:00')"
            separator=" until "
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
