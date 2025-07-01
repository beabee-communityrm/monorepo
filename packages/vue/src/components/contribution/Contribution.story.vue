<script lang="ts" setup>
import type { ContentPaymentData } from '@beabee/beabee-common';
import { ContributionPeriod, PaymentMethod } from '@beabee/beabee-common';

import { reactive } from 'vue';

import Contribution from './Contribution.vue';

const content = {
  initialAmount: 25,
  initialPeriod: ContributionPeriod.Monthly,
  minMonthlyAmount: 1,
  showAbsorbFee: true,
  periods: [
    {
      name: ContributionPeriod.Monthly,
      presetAmounts: [5, 10, 25, 50],
    },
    {
      name: ContributionPeriod.Annually,
      presetAmounts: [60, 120, 300, 600],
    },
  ],
  paymentMethods: [PaymentMethod.StripeCard, PaymentMethod.StripePayPal],
};

const paymentContent: ContentPaymentData = {
  stripePublicKey: 'pk_test_123',
  stripeCountry: 'eu',
  taxRate: 0,
  taxRateEnabled: false,
  noticeText: '',
};

// Mock currency formatter
const currencyFormatter = (value: number) => `€${value}`;
const currencySymbol = '€';

// State for the playground
const state = reactive({
  amount: 25,
  period: ContributionPeriod.Monthly,
  payFee: true,
  paymentMethod: PaymentMethod.StripeCard,
  showPeriod: true,
  showPaymentMethod: true,
  disabled: false,
});

// State for different scenarios
const monthlyState = reactive({
  amount: 25,
  period: ContributionPeriod.Monthly,
  payFee: true,
  paymentMethod: PaymentMethod.StripeCard,
});

const yearlyState = reactive({
  amount: 300,
  period: ContributionPeriod.Annually,
  payFee: false,
  paymentMethod: PaymentMethod.StripePayPal,
});

const minimumState = reactive({
  amount: 1,
  period: ContributionPeriod.Monthly,
  payFee: true,
  paymentMethod: PaymentMethod.StripeCard,
});
</script>

<template>
  <Story title="Contribution/Contribution">
    <Variant title="Playground">
      <div class="max-w-lg">
        <Contribution
          v-model:amount="state.amount"
          v-model:period="state.period"
          v-model:pay-fee="state.payFee"
          v-model:payment-method="state.paymentMethod"
          :content="content"
          :payment-content="paymentContent"
          :show-period="state.showPeriod"
          :show-payment-method="state.showPaymentMethod"
          :disabled="state.disabled"
          :currency-symbol="currencySymbol"
          :currency-formatter="currencyFormatter"
        />
        <div class="mt-6 rounded bg-grey-lighter p-4 text-sm">
          <h4 class="mb-2 font-semibold">Current Values:</h4>
          <p><strong>Amount:</strong> €{{ state.amount }}</p>
          <p><strong>Period:</strong> {{ state.period }}</p>
          <p><strong>Pay Fee:</strong> {{ state.payFee ? 'Yes' : 'No' }}</p>
          <p><strong>Payment Method:</strong> {{ state.paymentMethod }}</p>
        </div>
      </div>

      <template #controls>
        <HstNumber v-model="state.amount" title="Amount" />
        <HstCheckbox v-model="state.showPeriod" title="Show Period" />
        <HstCheckbox
          v-model="state.showPaymentMethod"
          title="Show Payment Method"
        />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant title="Monthly Contribution">
      <div class="max-w-lg">
        <Contribution
          v-model:amount="monthlyState.amount"
          v-model:period="monthlyState.period"
          v-model:pay-fee="monthlyState.payFee"
          v-model:payment-method="monthlyState.paymentMethod"
          :content="content"
          :payment-content="paymentContent"
          :show-period="true"
          :show-payment-method="true"
          :disabled="false"
          :currency-symbol="currencySymbol"
          :currency-formatter="currencyFormatter"
        />
        <div class="mt-4 text-sm text-grey">
          Monthly contribution with fee absorption option
        </div>
      </div>
    </Variant>

    <Variant title="Yearly Contribution">
      <div class="max-w-lg">
        <Contribution
          v-model:amount="yearlyState.amount"
          v-model:period="yearlyState.period"
          v-model:pay-fee="yearlyState.payFee"
          v-model:payment-method="yearlyState.paymentMethod"
          :content="content"
          :payment-content="paymentContent"
          :show-period="true"
          :show-payment-method="true"
          :disabled="false"
          :currency-symbol="currencySymbol"
          :currency-formatter="currencyFormatter"
        />
        <div class="mt-4 text-sm text-grey">
          Annual contribution (fee option hidden for yearly)
        </div>
      </div>
    </Variant>

    <Variant title="Minimum Amount (Forced Fee)">
      <div class="max-w-lg">
        <Contribution
          v-model:amount="minimumState.amount"
          v-model:period="minimumState.period"
          v-model:pay-fee="minimumState.payFee"
          v-model:payment-method="minimumState.paymentMethod"
          :content="content"
          :payment-content="paymentContent"
          :show-period="true"
          :show-payment-method="true"
          :disabled="false"
          :currency-symbol="currencySymbol"
          :currency-formatter="currencyFormatter"
        />
        <div class="mt-4 text-sm text-grey">
          Minimum contribution amount forces fee absorption
        </div>
      </div>
    </Variant>

    <Variant title="Amount Only">
      <div class="max-w-lg">
        <Contribution
          v-model:amount="state.amount"
          v-model:period="state.period"
          v-model:pay-fee="state.payFee"
          v-model:payment-method="state.paymentMethod"
          :content="content"
          :payment-content="paymentContent"
          :show-period="false"
          :show-payment-method="false"
          :disabled="false"
          :currency-symbol="currencySymbol"
          :currency-formatter="currencyFormatter"
        />
        <div class="mt-4 text-sm text-grey">
          Amount selection only (period and payment method hidden)
        </div>
      </div>
    </Variant>

    <Variant title="Disabled State">
      <div class="max-w-lg">
        <Contribution
          v-model:amount="state.amount"
          v-model:period="state.period"
          v-model:pay-fee="state.payFee"
          v-model:payment-method="state.paymentMethod"
          :content="content"
          :payment-content="paymentContent"
          :show-period="true"
          :show-payment-method="true"
          :disabled="true"
          :currency-symbol="currencySymbol"
          :currency-formatter="currencyFormatter"
        />
        <div class="mt-4 text-sm text-grey">All form elements are disabled</div>
      </div>
    </Variant>

    <Variant title="Single Payment Method">
      <div class="max-w-lg">
        <Contribution
          v-model:amount="state.amount"
          v-model:period="state.period"
          v-model:pay-fee="state.payFee"
          v-model:payment-method="state.paymentMethod"
          :content="{
            ...content,
            paymentMethods: [PaymentMethod.StripeCard],
          }"
          :payment-content="paymentContent"
          :show-period="true"
          :show-payment-method="true"
          :disabled="false"
          :currency-symbol="currencySymbol"
          :currency-formatter="currencyFormatter"
        />
        <div class="mt-4 text-sm text-grey">
          Only one payment method available
        </div>
      </div>
    </Variant>
  </Story>
</template>
