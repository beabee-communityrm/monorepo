<script lang="ts" setup>
import {
  addDays,
  addHours,
  addMinutes,
  subDays,
  subHours,
  subMinutes,
} from 'date-fns';
import { reactive } from 'vue';

import AppTime from './AppTime.vue';

const now = new Date();

// Test dates
const dates = {
  past: {
    fiveMinutesAgo: subMinutes(now, 5),
    oneHourAgo: subHours(now, 1),
    threeDaysAgo: subDays(now, 3),
  },
  future: {
    inFiveMinutes: addMinutes(now, 5),
    inOneHour: addHours(now, 1),
    inThreeDays: addDays(now, 3),
  },
};

const state = reactive({
  selectedTimestamp: dates.past.oneHourAgo.getTime(),
  timeOnly: false,
});

// Create simple timestamp options for Histoire controls
const timestampOptions: { label: string; value: number }[] = [
  { label: '5 minutes ago', value: dates.past.fiveMinutesAgo.getTime() },
  { label: '1 hour ago', value: dates.past.oneHourAgo.getTime() },
  { label: '3 days ago', value: dates.past.threeDaysAgo.getTime() },
  { label: 'In 5 minutes', value: dates.future.inFiveMinutes.getTime() },
  { label: 'In 1 hour', value: dates.future.inOneHour.getTime() },
  { label: 'In 3 days', value: dates.future.inThreeDays.getTime() },
];
</script>

<template>
  <Story title="Utility/AppTime">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <div class="rounded border p-4">
          <p class="mb-2 font-medium">Selected time:</p>
          <AppTime
            :datetime="state.selectedTimestamp"
            :time-only="state.timeOnly"
          />
          <p class="mt-2 text-xs text-body-60">
            Timestamp: {{ state.selectedTimestamp }}
          </p>
        </div>
      </div>

      <template #controls>
        <HstSelect
          v-model="state.selectedTimestamp"
          title="Date/Time"
          :options="timestampOptions"
        />
        <HstCheckbox v-model="state.timeOnly" title="Time Only" />
      </template>
    </Variant>

    <Variant title="Past Times">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          v-for="(date, key) in dates.past"
          :key="key"
          class="rounded border p-4"
        >
          <p class="mb-2 font-medium capitalize">
            {{ key.replace(/([A-Z])/g, ' $1') }}:
          </p>
          <AppTime :datetime="date" />
        </div>
      </div>
    </Variant>

    <Variant title="Future Times">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          v-for="(date, key) in dates.future"
          :key="key"
          class="rounded border p-4"
        >
          <p class="mb-2 font-medium capitalize">
            {{ key.replace(/([A-Z])/g, ' $1') }}:
          </p>
          <AppTime :datetime="date" />
        </div>
      </div>
    </Variant>

    <Variant title="Time Only Mode">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded border p-4">
          <p class="mb-2 font-medium">1 hour ago (time only):</p>
          <AppTime :datetime="dates.past.oneHourAgo.getTime()" time-only />
        </div>
        <div class="rounded border p-4">
          <p class="mb-2 font-medium">1 hour ago (with template):</p>
          <AppTime :datetime="dates.past.oneHourAgo.getTime()" />
        </div>
        <div class="rounded border p-4">
          <p class="mb-2 font-medium">In 1 hour (time only):</p>
          <AppTime :datetime="dates.future.inOneHour.getTime()" time-only />
        </div>
      </div>
    </Variant>

    <Variant title="Real-time Updates">
      <div class="rounded border p-4">
        <p class="mb-2 font-medium">Current time (updates every second):</p>
        <AppTime :datetime="now" />
        <p class="mt-2 text-sm text-body-80">
          Note: In a real application, you would update the datetime prop
          periodically
        </p>
      </div>
    </Variant>
  </Story>
</template>
