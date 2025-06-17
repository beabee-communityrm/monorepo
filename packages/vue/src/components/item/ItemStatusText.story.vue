<script lang="ts" setup>
import { ItemStatus } from '@beabee/beabee-common';

import { reactive } from 'vue';

import ItemStatusText from './ItemStatusText.vue';

const state = reactive({
  status: ItemStatus.Open,
  statusText: 'Open',
  starts: new Date('2024-01-15T10:00:00'),
  expires: new Date('2024-03-15T18:00:00'),
  circle: false,
  inline: false,
  scheduledText: 'Starts in 2 days',
  openText: 'Ends in 5 hours',
  endedText: 'Ended 1 week ago',
});

const statusOptions = [
  { label: 'Draft', value: ItemStatus.Draft, text: 'Draft' },
  { label: 'Scheduled', value: ItemStatus.Scheduled, text: 'Scheduled' },
  { label: 'Open', value: ItemStatus.Open, text: 'Open' },
  { label: 'Ended', value: ItemStatus.Ended, text: 'Ended' },
] as const;

// Real-world event scenarios
const eventScenarios = [
  {
    title: 'Conference Registration',
    status: ItemStatus.Scheduled,
    statusText: 'Registration Opening Soon',
    starts: new Date('2024-06-15T09:00:00'),
    expires: new Date('2024-06-30T23:59:59'),
    scheduledText: 'Registration opens in 3 days',
    openText: 'Registration closes in 15 days',
    endedText: 'Registration closed 2 weeks ago',
  },
  {
    title: 'Community Survey',
    status: ItemStatus.Open,
    statusText: 'Survey Active',
    starts: new Date('2024-01-01T00:00:00'),
    expires: new Date('2024-02-01T23:59:59'),
    scheduledText: 'Survey starts in 1 week',
    openText: 'Survey closes in 5 days',
    endedText: 'Survey ended 1 month ago',
  },
  {
    title: 'Annual Meeting',
    status: ItemStatus.Ended,
    statusText: 'Meeting Completed',
    starts: new Date('2023-12-15T14:00:00'),
    expires: new Date('2023-12-15T16:00:00'),
    scheduledText: 'Meeting starts in 2 hours',
    openText: 'Meeting in progress (ends in 30 minutes)',
    endedText: 'Meeting ended 2 months ago',
  },
  {
    title: 'Newsletter Draft',
    status: ItemStatus.Draft,
    statusText: 'In Preparation',
    starts: null,
    expires: null,
    scheduledText: '',
    openText: '',
    endedText: '',
  },
];

// Multilingual examples
const multilingualExamples = [
  {
    locale: 'English',
    scheduled: 'Starts in 2 days',
    open: 'Ends in 5 hours',
    ended: 'Ended 1 week ago',
  },
  {
    locale: 'German',
    scheduled: 'Beginnt in 2 Tagen',
    open: 'Endet in 5 Stunden',
    ended: 'Vor 1 Woche beendet',
  },
  {
    locale: 'French',
    scheduled: 'Commence dans 2 jours',
    open: 'Se termine dans 5 heures',
    ended: 'Terminé il y a 1 semaine',
  },
  {
    locale: 'Spanish',
    scheduled: 'Comienza en 2 días',
    open: 'Termina en 5 horas',
    ended: 'Terminó hace 1 semana',
  },
];
</script>

<template>
  <Story title="Item/ItemStatusText">
    <Variant title="Playground">
      <div class="flex max-w-md flex-col gap-4">
        <ItemStatusText
          :status="state.status"
          :status-text="state.statusText"
          :starts="state.starts"
          :expires="state.expires"
          :circle="state.circle"
          :inline="state.inline"
          :scheduled-text="state.scheduledText"
          :open-text="state.openText"
          :ended-text="state.endedText"
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
        <HstDate v-model="state.starts" title="Start Date" />
        <HstDate v-model="state.expires" title="End Date" />
        <HstText v-model="state.scheduledText" title="Scheduled Text" />
        <HstText v-model="state.openText" title="Open Text" />
        <HstText v-model="state.endedText" title="Ended Text" />
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
            status-text="Event Active"
            :starts="new Date('2024-01-01T00:00:00')"
            :expires="new Date('2024-02-01T23:59:59')"
            open-text="Registration closes in 5 days"
            circle
          />
        </div>

        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Horizontal (Inline) Layout</h4>
          <ItemStatusText
            :status="ItemStatus.Open"
            status-text="Event Active"
            :starts="new Date('2024-01-01T00:00:00')"
            :expires="new Date('2024-02-01T23:59:59')"
            open-text="Registration closes in 5 days"
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
                :status-text="scenario.statusText"
                :starts="scenario.starts"
                :expires="scenario.expires"
                :scheduled-text="scenario.scheduledText"
                :open-text="scenario.openText"
                :ended-text="scenario.endedText"
                circle
              />
            </div>
            <div class="bg-gray-50 rounded p-3">
              <span class="text-gray-600 mb-2 block text-sm"
                >Inline Layout:</span
              >
              <ItemStatusText
                :status="scenario.status"
                :status-text="scenario.statusText"
                :starts="scenario.starts"
                :expires="scenario.expires"
                :scheduled-text="scenario.scheduledText"
                :open-text="scenario.openText"
                :ended-text="scenario.endedText"
                inline
                circle
              />
            </div>
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Status-Specific Examples">
      <div class="flex flex-col gap-6">
        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Scheduled Status</h4>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ItemStatusText
              :status="ItemStatus.Scheduled"
              status-text="Upcoming Event"
              :starts="new Date('2024-06-15T09:00:00')"
              :expires="new Date('2024-06-15T17:00:00')"
              scheduled-text="Event starts in 3 days"
              circle
            />
            <ItemStatusText
              :status="ItemStatus.Scheduled"
              status-text="Launch Preparation"
              :starts="new Date('2024-03-01T00:00:00')"
              scheduled-text="Launch scheduled for next month"
              inline
              circle
            />
          </div>
        </div>

        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Open Status</h4>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ItemStatusText
              :status="ItemStatus.Open"
              status-text="Active Campaign"
              :expires="new Date('2024-02-29T23:59:59')"
              open-text="Campaign ends in 10 days"
              circle
            />
            <ItemStatusText
              :status="ItemStatus.Open"
              status-text="Registration Open"
              :starts="new Date('2024-01-01T00:00:00')"
              :expires="new Date('2024-01-31T23:59:59')"
              open-text="Registration closes in 2 weeks"
              inline
              circle
            />
          </div>
        </div>

        <div class="rounded border p-4">
          <h4 class="mb-3 font-semibold">Ended Status</h4>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
            <ItemStatusText
              :status="ItemStatus.Ended"
              status-text="Event Completed"
              :expires="new Date('2023-12-31T23:59:59')"
              ended-text="Event ended 2 months ago"
              circle
            />
            <ItemStatusText
              :status="ItemStatus.Ended"
              status-text="Campaign Finished"
              :starts="new Date('2023-11-01T00:00:00')"
              :expires="new Date('2023-11-30T23:59:59')"
              ended-text="Campaign completed 3 months ago"
              inline
              circle
            />
          </div>
        </div>
      </div>
    </Variant>

    <Variant title="Multilingual Support">
      <div class="rounded border p-4">
        <h4 class="mb-4 text-lg font-semibold">
          Internationalization Examples
        </h4>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div
            v-for="example in multilingualExamples"
            :key="example.locale"
            class="bg-gray-50 rounded p-4"
          >
            <h5 class="mb-3 font-medium">{{ example.locale }}</h5>
            <div class="flex flex-col gap-3">
              <ItemStatusText
                :status="ItemStatus.Scheduled"
                status-text="Geplant"
                :starts="new Date('2024-06-15T09:00:00')"
                :scheduled-text="example.scheduled"
                circle
              />
              <ItemStatusText
                :status="ItemStatus.Open"
                status-text="Aktiv"
                :expires="new Date('2024-02-29T23:59:59')"
                :open-text="example.open"
                circle
              />
              <ItemStatusText
                :status="ItemStatus.Ended"
                status-text="Beendet"
                :expires="new Date('2023-12-31T23:59:59')"
                :ended-text="example.ended"
                circle
              />
            </div>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
