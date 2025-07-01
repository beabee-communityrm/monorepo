<script lang="ts" setup>
import type { GetNoticeData } from '@beabee/beabee-common';
import { ItemStatus } from '@beabee/beabee-common';

import { reactive } from 'vue';

import NoticeForm from './NoticeForm.vue';

// Mock notice data for editing scenario
const mockNotice: GetNoticeData = {
  id: '1',
  name: 'Test Notice',
  starts: new Date('2024-01-15T09:00:00Z'),
  expires: new Date('2024-01-31T18:00:00Z'),
  text: 'This is a test notice',
  buttonText: 'Learn More',
  url: 'https://example.com',
  status: ItemStatus.Open,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

const formData = reactive({
  notice: undefined as GetNoticeData | undefined,
});

function handleSubmit(data: any) {
  console.log('Form submitted:', data);
}
</script>

<template>
  <Story title="Notice/NoticeForm" :layout="{ type: 'single', iframe: false }">
    <Variant title="Create New Notice">
      <NoticeForm :notice="undefined" @submit="handleSubmit" />
    </Variant>

    <Variant title="Edit Existing Notice">
      <NoticeForm :notice="mockNotice" @submit="handleSubmit" />
    </Variant>

    <Variant title="Interactive">
      <template #controls>
        <HstCheckbox v-model="formData.notice" title="Edit Mode">
          Use existing notice data
        </HstCheckbox>
      </template>

      <NoticeForm
        :notice="formData.notice ? mockNotice : undefined"
        @submit="handleSubmit"
      />
    </Variant>
  </Story>
</template>
