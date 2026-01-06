<!--
  # Contribution
  A comprehensive contribution form component that orchestrates all contribution-related inputs.
  Combines amount selection, period selection, payment method selection, and fee handling.

  ## Features
  - Period selection with dynamic amount adjustment
  - Amount validation and preset selection
  - Payment method selection with icons
  - Fee absorption option with automatic forcing for minimum amounts
  - Internal currency formatting using vue-i18n
  - Responsive layout with proper spacing
  - Full accessibility support
-->
<template>
  <div>
    <AppChoice
      v-if="showPeriod"
      v-model="period"
      :items="periodItems"
      :disabled="disabled"
      class="mb-4"
    />

    <ContributionAmount
      v-model.number="amount"
      :period="period"
      :min-amount="minAmount"
      :defined-amounts="definedAmounts"
      :disabled="disabled"
      class="mb-4"
    />

    <slot></slot>

    <ContributionMethod
      v-if="showPaymentMethod"
      v-model="paymentMethod"
      :methods="content.paymentMethods"
      :disabled="disabled"
      :title="t('join.paymentMethod')"
      class="mb-4"
    />

    <ContributionFee
      v-if="content.showAbsorbFee"
      v-model="payFee"
      :amount="amount"
      :period="period"
      :fee="fee"
      :force="shouldForceFee"
      :disabled="disabled"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  type ContentPaymentData,
  ContributionPeriod,
  PaymentMethod,
  type PaymentPeriod,
  calcPaymentFee,
} from '@beabee/beabee-common';
import { AppChoice } from '@beabee/vue';

import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ContributionContent } from '../../type/contribution';
import ContributionAmount from './ContributionAmount.vue';
import ContributionFee from './ContributionFee.vue';
import ContributionMethod from './ContributionMethod.vue';

const { t } = useI18n();

/**
 * Props for the Contribution component
 */
export interface ContributionProps {
  /** Configuration data for the contribution form */
  content: ContributionContent;
  /** Payment-related configuration */
  paymentContent: ContentPaymentData;
  /** Configure if the form is being used as a contribution only form or as a one-time only donation form */
  mode?: 'one-time' | 'contribution';
  /** Whether to show period selection */
  showPeriod?: boolean;
  /** Whether to show payment method selection */
  showPaymentMethod?: boolean;
  /** Whether the form is disabled */
  disabled?: boolean;
}

const props = withDefaults(defineProps<ContributionProps>(), {
  showPeriod: true,
  showPaymentMethod: true,
  disabled: false,
  mode: undefined, // the form allows one-time donations and contributions
});

const amount = defineModel<number>('amount', { required: true });
const period = defineModel<PaymentPeriod>('period', { required: true });
const payFee = defineModel<boolean>('payFee', { required: true });
const paymentMethod = defineModel<PaymentMethod>('paymentMethod', {
  required: true,
});

const fee = computed(() =>
  calcPaymentFee(
    {
      amount: amount.value,
      period: period.value,
      paymentMethod: paymentMethod.value,
    },
    props.paymentContent.stripeCountry
  )
);

const isAnnually = computed(() => period.value === ContributionPeriod.Annually);

const minAmount = computed(() => {
  const { minMonthlyAmount } = props.content;
  return isAnnually.value ? minMonthlyAmount * 12 : minMonthlyAmount;
});

const definedAmounts = computed(() => {
  const selectedPeriod = props.content.periods.find((p) => {
    return p.name === period.value;
  });
  return selectedPeriod?.presetAmounts || [];
});

const periodItems = computed(() => {
  return props.content.periods
    .filter(
      (p) =>
        !props.mode || // All
        (props.mode === 'one-time' && p.name === 'one-time') || // Only one-time
        (props.mode === 'contribution' && p.name !== 'one-time') // Only contribution
    )
    .map((period) => ({
      label: t(`common.paymentPeriod.${period.name}`),
      value: period.name,
    }));
});

watch(isAnnually, (value) => {
  amount.value = value ? amount.value * 12 : Math.floor(amount.value / 12);
});

const shouldForceFee = computed(() => {
  return props.content.showAbsorbFee && amount.value === 1 && !isAnnually.value;
});

watch(shouldForceFee, (force) => {
  if (force) payFee.value = true;
});
</script>
