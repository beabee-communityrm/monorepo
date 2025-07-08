<script lang="ts" setup>
import { PaymentStatus } from '@beabee/beabee-common';

import { reactive } from 'vue';

import PaymentStatusComponent from './PaymentStatus.vue';

const state = reactive({
  status: PaymentStatus.Successful,
});

const statusOptions = [
  { label: 'Draft', value: PaymentStatus.Draft },
  { label: 'Pending', value: PaymentStatus.Pending },
  { label: 'Successful', value: PaymentStatus.Successful },
  { label: 'Cancelled', value: PaymentStatus.Cancelled },
  { label: 'Failed', value: PaymentStatus.Failed },
];

const updateStatus = (value: PaymentStatus) => {
  state.status = value;
};
</script>

<template>
  <Story title="Payment/PaymentStatus">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <PaymentStatusComponent :status="state.status" />
      </div>

      <template #controls>
        <HstSelect
          :model-value="state.status"
          title="Status"
          :options="
            statusOptions.map((opt) => ({ label: opt.label, value: opt.value }))
          "
          @update:model-value="updateStatus($event)"
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
          <PaymentStatusComponent :status="option.value" />
          <small class="text-body-60">{{ option.label }}</small>
        </div>
      </div>
    </Variant>

    <Variant title="In Context">
      <div class="space-y-4">
        <div class="flex items-center justify-between rounded border p-4">
          <span>Payment #12345</span>
          <PaymentStatusComponent :status="PaymentStatus.Successful" />
        </div>
        <div class="flex items-center justify-between rounded border p-4">
          <span>Payment #12346</span>
          <PaymentStatusComponent :status="PaymentStatus.Failed" />
        </div>
        <div class="flex items-center justify-between rounded border p-4">
          <span>Payment #12347</span>
          <PaymentStatusComponent :status="PaymentStatus.Pending" />
        </div>
      </div>
    </Variant>
  </Story>
</template>
