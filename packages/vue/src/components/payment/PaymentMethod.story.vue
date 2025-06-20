<script lang="ts" setup>
import { PaymentMethod } from '@beabee/beabee-common';
import type { PaymentSource } from '@beabee/beabee-common';

import { reactive } from 'vue';

import PaymentMethodComponent from './PaymentMethod.vue';

const state = reactive({
  sourceType: 'stripe-card',
});

const mockSources: Record<string, PaymentSource> = {
  'stripe-card': {
    method: PaymentMethod.StripeCard,
    isLink: false,
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025,
  } as any,
  'stripe-card-link': {
    method: PaymentMethod.StripeCard,
    isLink: true,
    email: 'user@example.com',
  } as any,
  'stripe-bacs': {
    method: PaymentMethod.StripeBACS,
    sortCode: '20-00-00',
    last4: '1234',
  } as any,
  'stripe-sepa': {
    method: PaymentMethod.StripeSEPA,
    country: 'DE',
    bankCode: '1234',
    branchCode: '5678',
    last4: '9012',
  } as any,
  'gocardless-dd': {
    method: PaymentMethod.GoCardlessDirectDebit,
    accountHolderName: 'John Doe',
    bankName: 'Example Bank',
    accountNumberEnding: '1234',
  } as any,
  'stripe-paypal': {
    method: PaymentMethod.StripePayPal,
    payerEmail: 'user@example.com',
  } as any,
};

const sourceOptions = [
  { label: 'Stripe Card', value: 'stripe-card' },
  { label: 'Stripe Card Link', value: 'stripe-card-link' },
  { label: 'Stripe BACS', value: 'stripe-bacs' },
  { label: 'Stripe SEPA', value: 'stripe-sepa' },
  { label: 'GoCardless Direct Debit', value: 'gocardless-dd' },
  { label: 'Stripe PayPal', value: 'stripe-paypal' },
];
</script>

<template>
  <Story title="Payment/PaymentMethod">
    <Variant title="Playground">
      <div class="flex flex-col gap-4">
        <PaymentMethodComponent :source="mockSources[state.sourceType]" />
      </div>

      <template #controls>
        <HstSelect
          v-model="state.sourceType"
          title="Payment Source Type"
          :options="sourceOptions"
        />
      </template>
    </Variant>

    <Variant title="All Payment Methods">
      <div class="space-y-4">
        <div
          v-for="(source, key) in mockSources"
          :key="key"
          class="flex flex-col gap-2 rounded border p-4"
        >
          <h3 class="text-sm font-medium text-body-60">
            {{ sourceOptions.find((opt) => opt.value === key)?.label }}
          </h3>
          <PaymentMethodComponent :source="source" />
        </div>
      </div>
    </Variant>

    <Variant title="In Payment List">
      <div class="space-y-2">
        <div
          v-for="(source, index) in Object.values(mockSources).slice(0, 3)"
          :key="index"
          class="flex items-center justify-between rounded border p-4"
        >
          <div class="flex flex-col gap-1">
            <span class="font-medium">Payment #{{ 12345 + index }}</span>
            <PaymentMethodComponent :source="source" />
          </div>
          <span class="font-bold text-success">£25.00</span>
        </div>
      </div>
    </Variant>

    <Variant title="Compact Layout">
      <div class="max-w-md">
        <div class="space-y-3">
          <div
            v-for="(source, index) in Object.values(mockSources)"
            :key="index"
            class="flex items-center justify-between border-b py-2 last:border-b-0"
          >
            <PaymentMethodComponent :source="source" />
            <span class="text-sm text-body-60">Active</span>
          </div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
