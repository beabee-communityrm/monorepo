<!--
  # Contribution
  A comprehensive contribution form component that orchestrates all contribution-related inputs.
  Combines amount selection, period selection, payment method selection, and fee handling.
  
  ## Props
  - `amount` (number): Current contribution amount
  - `period` (ContributionPeriod): Current contribution period
  - `payFee` (boolean): Whether to pay processing fee
  - `paymentMethod` (PaymentMethod): Selected payment method
  - `content` (ContributionContent): Configuration data for the contribution form
  - `paymentContent` (ContentPaymentData): Payment-related configuration
  - `showPeriod` (boolean): Whether to show period selection
  - `showPaymentMethod` (boolean): Whether to show payment method selection
  - `disabled` (boolean): Whether the form is disabled
  - `labels` (ContributionLabels): All text labels and translations
  
  ## Events
  - `update:amount` (number): Emitted when amount changes
  - `update:period` (ContributionPeriod): Emitted when period changes
  - `update:payFee` (boolean): Emitted when pay fee selection changes
  - `update:paymentMethod` (PaymentMethod): Emitted when payment method changes
  
  ## Features
  - Period selection with dynamic amount adjustment
  - Amount validation and preset selection
  - Payment method selection with icons
  - Fee absorption option with automatic forcing for minimum amounts
  - Responsive layout with proper spacing
  - Full accessibility support
-->
<template>
  <div>
    <AppChoice
      v-if="showPeriod"
      v-model="periodProxy"
      :items="
        content.periods.map((period) => ({
          label: labels.periods[period.name],
          value: period.name,
        }))
      "
      :disabled="disabled"
      class="mb-4"
    />

    <ContributionAmount
      v-model.number="amountProxy"
      :is-monthly="isMonthly"
      :min-amount="minAmount"
      :defined-amounts="definedAmounts"
      :disabled="disabled"
      :currency-symbol="labels.currencySymbol"
      :minimum-text="labels.minimumContribution"
      :per-period-text="perPeriodText"
      :currency-formatter="labels.currencyFormatter"
      class="mb-4"
    />

    <slot></slot>

    <ContributionMethod
      v-if="showPaymentMethod"
      v-model="paymentMethodProxy"
      :methods="content.paymentMethods"
      :disabled="disabled"
      :title="labels.paymentMethodTitle"
      :method-labels="labels.paymentMethods"
      class="mb-4"
    />

    <ContributionFee
      v-if="isMonthly && content.showAbsorbFee"
      v-model="payFeeProxy"
      :amount="amountProxy"
      :fee="fee"
      :force="shouldForceFee"
      :disabled="disabled"
      :absorb-fee-text="absorbFeeText"
      :absorb-fee-label="absorbFeeLabel"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  type ContentPaymentData,
  ContributionPeriod,
  PaymentMethod,
  calcPaymentFee,
} from '@beabee/beabee-common';

import { computed, watch } from 'vue';

import type { ContributionContent } from '../../types/contribution';
import { AppChoice } from '../form';
import ContributionAmount from './ContributionAmount.vue';
import ContributionFee from './ContributionFee.vue';
import ContributionMethod from './ContributionMethod.vue';

/**
 * Labels and text content for the Contribution component
 */
export interface ContributionLabels {
  /** Currency symbol (e.g. "€", "$") */
  currencySymbol: string;
  /** Text for minimum contribution error */
  minimumContribution: string;
  /** Text for per month display */
  perMonth: string;
  /** Text for per year display */
  perYear: string;
  /** Title for payment method selection */
  paymentMethodTitle: string;
  /** Text for fee absorption explanation */
  absorbFeeText: string;
  /** Text for optional fee absorption checkbox */
  absorbFeeOptional: string;
  /** Text for forced fee absorption checkbox */
  absorbFeeForced: string;
  /** Labels for contribution periods */
  periods: Record<string, string>;
  /** Labels for payment methods */
  paymentMethods: Record<PaymentMethod, string>;
  /** Function to format currency values */
  currencyFormatter: (value: number) => string;
}

/**
 * Props for the Contribution component
 */
export interface ContributionProps {
  /** Current contribution amount */
  amount: number;
  /** Current contribution period */
  period: ContributionPeriod;
  /** Whether to pay processing fee */
  payFee: boolean;
  /** Selected payment method */
  paymentMethod: PaymentMethod;
  /** Configuration data for the contribution form */
  content: ContributionContent;
  /** Payment-related configuration */
  paymentContent: ContentPaymentData;
  /** Whether to show period selection */
  showPeriod?: boolean;
  /** Whether to show payment method selection */
  showPaymentMethod?: boolean;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** All text labels and translations */
  labels: ContributionLabels;
}

const props = withDefaults(defineProps<ContributionProps>(), {
  showPeriod: true,
  showPaymentMethod: true,
  disabled: false,
});

const fee = computed(() =>
  calcPaymentFee(props, props.paymentContent.stripeCountry)
);

const emit = defineEmits([
  'update:amount',
  'update:period',
  'update:payFee',
  'update:paymentMethod',
]);

const amountProxy = computed({
  get: () => props.amount,
  set: (amount) => emit('update:amount', amount),
});

const periodProxy = computed({
  get: () => props.period,
  set: (period) => emit('update:period', period),
});

const payFeeProxy = computed({
  get: () => props.payFee,
  set: (payFee) => emit('update:payFee', payFee),
});

const paymentMethodProxy = computed({
  get: () => props.paymentMethod,
  set: (paymentMethod) => emit('update:paymentMethod', paymentMethod),
});

const isMonthly = computed(
  () => periodProxy.value === ContributionPeriod.Monthly
);

const minAmount = computed(() => {
  const { minMonthlyAmount } = props.content;
  return isMonthly.value ? minMonthlyAmount : minMonthlyAmount * 12;
});

const definedAmounts = computed(() => {
  const selectedPeriod = props.content.periods.find((period) => {
    return period.name === periodProxy.value;
  });
  return selectedPeriod?.presetAmounts || [];
});

const perPeriodText = computed(() => {
  return isMonthly.value ? props.labels.perMonth : props.labels.perYear;
});

watch(isMonthly, (value) => {
  amountProxy.value = value
    ? Math.floor(amountProxy.value / 12)
    : amountProxy.value * 12;
});

const shouldForceFee = computed(() => {
  return (
    props.content.showAbsorbFee && amountProxy.value === 1 && isMonthly.value
  );
});

watch(shouldForceFee, (force) => {
  if (force) payFeeProxy.value = true;
});

const absorbFeeText = computed(() =>
  props.labels.absorbFeeText.replace(
    '{fee}',
    props.labels.currencyFormatter(fee.value)
  )
);

const absorbFeeLabel = computed(() => {
  const template = shouldForceFee.value
    ? props.labels.absorbFeeForced
    : props.labels.absorbFeeOptional;
  return template
    .replace('{fee}', props.labels.currencyFormatter(fee.value))
    .replace('{amount}', props.labels.currencyFormatter(amountProxy.value));
});
</script>
