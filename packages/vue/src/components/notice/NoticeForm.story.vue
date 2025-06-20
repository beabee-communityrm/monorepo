<script lang="ts" setup>
import type { CreateNoticeData, GetNoticeData } from '@beabee/beabee-common';
import { ItemStatus } from '@beabee/beabee-common';

import { reactive, ref } from 'vue';

import type { NoticeFormLabels } from '../../types/notice';
import NoticeForm from './NoticeForm.vue';

// Default labels in English for the story
const defaultLabels: NoticeFormLabels = {
  save: 'Save Notice',
  name: 'Notice Name',
  startDateAndTime: 'Start Date and Time',
  expirationDateAndTime: 'Expiration Date and Time',
  text: 'Notice Text',
  buttonText: 'Button Text (optional)',
  url: 'URL (optional)',
};

// German labels for localization example
const germanLabels: NoticeFormLabels = {
  save: 'Mitteilung speichern',
  name: 'Name der Mitteilung',
  startDateAndTime: 'Startdatum und -zeit',
  expirationDateAndTime: 'Ablaufdatum und -zeit',
  text: 'Mitteilungstext',
  buttonText: 'Button-Text (optional)',
  url: 'URL (optional)',
};

// State for the playground
const state = reactive({
  labels: { ...defaultLabels },
  useGermanLabels: false,
  showExistingNotice: false,
});

// Example existing notice data
const existingNotice: GetNoticeData = {
  id: '1',
  name: 'Maintenance Notice',
  starts: new Date('2024-01-15T09:00:00'),
  expires: new Date('2024-01-15T17:00:00'),
  text: 'Our system will be undergoing maintenance. Please expect some downtime.',
  buttonText: 'Learn More',
  url: 'https://example.com/maintenance',
  status: ItemStatus.Open,
  createdAt: new Date('2024-01-01T00:00:00'),
  updatedAt: new Date('2024-01-01T00:00:00'),
};

// Track form submissions
const submissionCount = ref(0);
const lastSubmission = ref<CreateNoticeData | null>(null);

function handleSubmit(data: CreateNoticeData) {
  submissionCount.value++;
  lastSubmission.value = data;

  // Log to console for debugging
  console.log('Notice form submitted:', data);
}

// Update labels when language changes
function updateLabels() {
  state.labels = state.useGermanLabels
    ? { ...germanLabels }
    : { ...defaultLabels };
}
</script>

<template>
  <Story title="Notice/NoticeForm">
    <Variant title="Playground">
      <div class="max-w-2xl space-y-6">
        <NoticeForm
          :notice="state.showExistingNotice ? existingNotice : undefined"
          :labels="state.labels"
          @submit="handleSubmit"
        />

        <!-- Show submission data -->
        <div v-if="lastSubmission" class="rounded-lg bg-grey-lighter p-4">
          <h3 class="mb-2 font-semibold">
            Last Submission ({{ submissionCount }}):
          </h3>
          <pre class="text-sm">{{
            JSON.stringify(lastSubmission, null, 2)
          }}</pre>
        </div>
      </div>

      <template #controls>
        <HstCheckbox
          v-model="state.useGermanLabels"
          title="Use German Labels"
          @update:model-value="updateLabels"
        />
        <HstCheckbox
          v-model="state.showExistingNotice"
          title="Show Existing Notice Data"
        />
        <HstText v-model="state.labels.save" title="Save Button Label" />
        <HstText v-model="state.labels.name" title="Name Field Label" />
        <HstText v-model="state.labels.text" title="Text Field Label" />
        <HstText
          v-model="state.labels.buttonText"
          title="Button Text Field Label"
        />
        <HstText v-model="state.labels.url" title="URL Field Label" />
      </template>
    </Variant>

    <Variant title="Empty Form">
      <div class="max-w-2xl">
        <NoticeForm :labels="defaultLabels" @submit="handleSubmit" />
      </div>
    </Variant>

    <Variant title="Pre-filled Form">
      <div class="max-w-2xl">
        <NoticeForm
          :notice="existingNotice"
          :labels="defaultLabels"
          @submit="handleSubmit"
        />
      </div>
    </Variant>

    <Variant title="German Localization">
      <div class="max-w-2xl">
        <NoticeForm :labels="germanLabels" @submit="handleSubmit" />
      </div>
    </Variant>

    <Variant title="Long Content Example">
      <div class="max-w-2xl">
        <NoticeForm
          :notice="{
            id: '2',
            name: 'Important System Update - Extended Maintenance Window',
            starts: new Date('2024-02-01T08:00:00'),
            expires: new Date('2024-02-02T06:00:00'),
            text: 'We are performing a major system upgrade that will significantly improve performance and security. This maintenance window is longer than usual to ensure all updates are applied correctly. During this time, all services will be unavailable. We apologize for any inconvenience this may cause.',
            buttonText: 'View Detailed Maintenance Schedule',
            url: 'https://example.com/maintenance-schedule-february-2024',
            status: ItemStatus.Scheduled,
            createdAt: new Date('2024-01-15T00:00:00'),
            updatedAt: new Date('2024-01-20T00:00:00'),
          }"
          :labels="defaultLabels"
          @submit="handleSubmit"
        />
      </div>
    </Variant>

    <Variant title="Notice Without Call-to-Action">
      <div class="max-w-2xl">
        <NoticeForm
          :notice="{
            id: '3',
            name: 'Information Notice',
            starts: new Date('2024-01-10T00:00:00'),
            expires: new Date('2024-01-31T23:59:59'),
            text: 'This is an informational notice without any call-to-action button.',
            buttonText: '',
            url: '',
            status: ItemStatus.Open,
            createdAt: new Date('2024-01-01T00:00:00'),
            updatedAt: new Date('2024-01-01T00:00:00'),
          }"
          :labels="defaultLabels"
          @submit="handleSubmit"
        />
      </div>
    </Variant>
  </Story>
</template>
