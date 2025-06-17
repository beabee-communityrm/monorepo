<script lang="ts" setup>
import type { BaseLocale } from '@beabee/locale';

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
  timeAgoTemplate: '{time} ago',
  timeInTemplate: 'in {time}',
  locale: 'en' as const,
});

const locales: BaseLocale[] = ['en', 'de', 'nl', 'pt', 'ru', 'it', 'fr'];

// Create simple timestamp options for Histoire controls
const timestampOptions: { label: string; value: number }[] = [
  { label: '5 minutes ago', value: dates.past.fiveMinutesAgo.getTime() },
  { label: '1 hour ago', value: dates.past.oneHourAgo.getTime() },
  { label: '3 days ago', value: dates.past.threeDaysAgo.getTime() },
  { label: 'In 5 minutes', value: dates.future.inFiveMinutes.getTime() },
  { label: 'In 1 hour', value: dates.future.inOneHour.getTime() },
  { label: 'In 3 days', value: dates.future.inThreeDays.getTime() },
];

// Locale-specific time templates based on the original i18n files
const localeTemplates: Record<BaseLocale, { timeAgo: string; timeIn: string }> =
  {
    en: { timeAgo: '{time} ago', timeIn: 'in {time}' },
    de: { timeAgo: 'vor {time}', timeIn: 'in {time}' },
    nl: { timeAgo: '{time} geleden', timeIn: 'in {time}' },
    pt: { timeAgo: 'há {time}', timeIn: 'em {time}' },
    ru: { timeAgo: '{time} назад', timeIn: 'через {time}' },
    it: { timeAgo: '{time} fa', timeIn: 'in {time}' },
    fr: { timeAgo: '{time} auparavant', timeIn: 'dans {time}' },
  } as const;

function getTimeAgoTemplate(locale: keyof typeof localeTemplates): string {
  return localeTemplates[locale]?.timeAgo || localeTemplates.en.timeAgo;
}

function getTimeInTemplate(locale: keyof typeof localeTemplates): string {
  return localeTemplates[locale]?.timeIn || localeTemplates.en.timeIn;
}
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
            :time-ago-template="state.timeAgoTemplate"
            :time-in-template="state.timeInTemplate"
            :locale="state.locale"
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
        <HstText
          v-model="state.timeAgoTemplate"
          title="Time Ago Template (use {time} placeholder)"
        />
        <HstText
          v-model="state.timeInTemplate"
          title="Time In Template (use {time} placeholder)"
        />
        <HstSelect v-model="state.locale" title="Locale" :options="locales" />
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

    <Variant title="Custom Templates">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded border p-4">
          <p class="mb-2 font-medium">Custom past template:</p>
          <AppTime
            :datetime="dates.past.oneHourAgo"
            time-ago-template="🕐 {time} before now"
          />
        </div>
        <div class="rounded border p-4">
          <p class="mb-2 font-medium">Custom future template:</p>
          <AppTime
            :datetime="dates.future.inOneHour"
            time-in-template="⏰ coming up in {time}"
          />
        </div>
      </div>
    </Variant>

    <Variant title="Different Locales">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div v-for="locale in locales" :key="locale" class="rounded border p-4">
          <p class="mb-2 font-medium">{{ locale.toUpperCase() }}:</p>
          <AppTime
            :datetime="dates.past.oneHourAgo.getTime()"
            :locale="locale"
            :time-ago-template="getTimeAgoTemplate(locale)"
            :time-in-template="getTimeInTemplate(locale)"
          />
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
