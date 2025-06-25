<script lang="ts" setup>
import {
  type ContentPaymentData,
  ContributionPeriod,
  PaymentMethod,
} from '@beabee/beabee-common';

import { reactive, ref } from 'vue';

import type { ContributionContent } from '../../types/contribution';
import Contribution, { type ContributionLabels } from './Contribution.vue';

const state = reactive({
  amount: 25,
  period: ContributionPeriod.Monthly,
  payFee: true,
  paymentMethod: PaymentMethod.StripeCard,
  showPeriod: true,
  showPaymentMethod: true,
  disabled: false,
});

const content: ContributionContent = {
  initialAmount: 5,
  initialPeriod: ContributionPeriod.Monthly,
  minMonthlyAmount: 5,
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
  paymentMethods: [
    PaymentMethod.StripeCard,
    PaymentMethod.StripePayPal,
    PaymentMethod.StripeSEPA,
  ],
};

const paymentContent: ContentPaymentData = {
  stripePublicKey: 'pk_test_123',
  stripeCountry: 'eu',
  taxRate: 0,
  taxRateEnabled: false,
  noticeText: '',
};

const labels: ContributionLabels = {
  currencySymbol: '€',
  minimumContribution: 'Minimum contribution',
  perMonth: 'per month',
  perYear: 'per year',
  paymentMethodTitle: 'Payment Method',
  absorbFeeText: 'Help us cover the {fee} processing fee for this transaction.',
  absorbFeeOptional:
    "I'll pay {fee} to cover the processing fee ({amount} total)",
  absorbFeeForced:
    'Processing fee of {fee} is required for this contribution amount',
  periods: {
    [ContributionPeriod.Monthly]: 'Monthly',
    [ContributionPeriod.Annually]: 'Annually',
  },
  paymentMethods: {
    [PaymentMethod.StripeCard]: 'Credit Card',
    [PaymentMethod.StripeSEPA]: 'SEPA',
    [PaymentMethod.StripeBACS]: 'BACS',
    [PaymentMethod.StripePayPal]: 'PayPal',
    [PaymentMethod.StripeIdeal]: 'iDEAL',
    [PaymentMethod.GoCardlessDirectDebit]: 'Direct Debit',
  },
  currencyFormatter: (value: number) => `€${value}`,
};

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
          :labels="labels"
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
          :labels="labels"
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
          :labels="labels"
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
          :labels="labels"
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
          :labels="labels"
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
          :labels="labels"
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
          :labels="labels"
        />
        <div class="mt-4 text-sm text-grey">
          Payment method selection is hidden when only one method is available
        </div>
      </div>
    </Variant>

    <Variant title="With Custom Content Slot">
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
          :disabled="false"
          :labels="labels"
        >
          <div
            class="my-4 rounded border border-primary-40 bg-primary-5 p-3 text-sm"
          >
            <p class="font-semibold">Special Offer!</p>
            <p>Join now and get your first month at 50% off.</p>
          </div>
        </Contribution>
        <div class="mt-4 text-sm text-grey">
          Custom content can be inserted between amount and payment method
        </div>
      </div>
    </Variant>
  </Story>
</template>
