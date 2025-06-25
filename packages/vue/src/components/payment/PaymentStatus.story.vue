<script lang="ts" setup>
import { PaymentStatus } from '@beabee/beabee-common';

import { reactive } from 'vue';

import PaymentStatusComponent from './PaymentStatus.vue';

const state = reactive({
  status: PaymentStatus.Successful,
  statusText: 'Successful',
});

const statusOptions = [
  { label: 'Draft', value: PaymentStatus.Draft, text: 'Draft' },
  { label: 'Pending', value: PaymentStatus.Pending, text: 'Pending' },
  { label: 'Successful', value: PaymentStatus.Successful, text: 'Successful' },
  { label: 'Cancelled', value: PaymentStatus.Cancelled, text: 'Cancelled' },
  { label: 'Failed', value: PaymentStatus.Failed, text: 'Failed' },
];

const updateStatus = (option: { value: PaymentStatus; text: string }) => {
  state.status = option.value;
  state.statusText = option.text;
};
</script>

<template>
  <Story title="Payment/PaymentStatus">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <PaymentStatusComponent
          :status="state.status"
          :status-text="state.statusText"
        />
      </div>

      <template #controls>
        <HstText v-model="state.statusText" title="Status Text" />
        <HstSelect
          :model-value="state.status"
          title="Status"
          :options="
            statusOptions.map((opt) => ({ label: opt.label, value: opt.value }))
          "
          @update:model-value="
            updateStatus(statusOptions.find((opt) => opt.value === $event)!)
          "
        />
      </template>
    </Variant>

    <Variant title="All Statuses">
      <div class="flex flex-wrap gap-4">
        <div
          v-for="option in statusOptions"
          :key="option.value"
          class="flex flex-col items-center gap-2"
        >
          <PaymentStatusComponent
            :status="option.value"
            :status-text="option.text"
          />
          <small class="text-body-60">{{ option.label }}</small>
        </div>
      </div>
    </Variant>

    <Variant title="In Context">
      <div class="space-y-4">
        <div class="flex items-center justify-between rounded border p-4">
          <span>Payment #12345</span>
          <PaymentStatusComponent
            :status="PaymentStatus.Successful"
            status-text="Successful"
          />
        </div>
        <div class="flex items-center justify-between rounded border p-4">
          <span>Payment #12346</span>
          <PaymentStatusComponent
            :status="PaymentStatus.Failed"
            status-text="Failed"
          />
        </div>
        <div class="flex items-center justify-between rounded border p-4">
          <span>Payment #12347</span>
          <PaymentStatusComponent
            :status="PaymentStatus.Pending"
            status-text="Pending"
          />
        </div>
      </div>
    </Variant>
  </Story>
</template>
