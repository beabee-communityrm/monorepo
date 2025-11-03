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
  - `currencySymbol` (string): Currency symbol (e.g. "€", "$")

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
  - Internal currency formatting using vue-i18n
  - Responsive layout with proper spacing
  - Full accessibility support
-->
<template>
  <div>
    <AppChoice
      v-if="showPeriod"
      v-model="periodProxy"
      :items="periodItems"
      :disabled="disabled"
      class="mb-4"
    />

    <ContributionAmount
      v-model.number="amountProxy"
      :period="periodProxy"
      :min-amount="minAmount"
      :defined-amounts="definedAmounts"
      :disabled="disabled"
      class="mb-4"
    />

    <slot></slot>

    <ContributionMethod
      v-if="showPaymentMethod"
      v-model="paymentMethodProxy"
      :methods="content.paymentMethods"
      :disabled="disabled"
      :title="t('join.paymentMethod')"
      class="mb-4"
    />

    <ContributionFee
      v-if="isNotAnnually && content.showAbsorbFee"
      v-model="payFeeProxy"
      :amount="amountProxy"
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
  /** Current contribution amount */
  amount: number;
  /** Current contribution period */
  period: PaymentPeriod;
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

const isNotAnnually = computed(
  () => periodProxy.value !== ContributionPeriod.Annually
);

const minAmount = computed(() => {
  const { minMonthlyAmount } = props.content;
  return isNotAnnually.value ? minMonthlyAmount : minMonthlyAmount * 12;
});

const definedAmounts = computed(() => {
  const selectedPeriod = props.content.periods.find((period) => {
    return period.name === periodProxy.value;
  });
  return selectedPeriod?.presetAmounts || [];
});

const periodItems = computed(() =>
  props.content.periods.map((period) => ({
    label: t(`common.paymentPeriod.${period.name}`),
    value: period.name,
  }))
);

watch(isNotAnnually, (value) => {
  amountProxy.value = value
    ? Math.floor(amountProxy.value / 12)
    : amountProxy.value * 12;
});

const shouldForceFee = computed(() => {
  return (
    props.content.showAbsorbFee &&
    amountProxy.value === 1 &&
    isNotAnnually.value
  );
});

watch(shouldForceFee, (force) => {
  if (force) payFeeProxy.value = true;
});
</script>
