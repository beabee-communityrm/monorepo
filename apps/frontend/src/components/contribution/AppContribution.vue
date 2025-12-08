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

import type { OneTimePaymentContent } from '@type/one-time-payment-content';
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
  content: ContributionContent | OneTimePaymentContent;
  /** Payment-related configuration */
  paymentContent: ContentPaymentData;
  /** Whether to show period selection */
  showPeriod?: boolean;
  /** Whether to show payment method selection */
  showPaymentMethod?: boolean;
  /** Whether the form is disabled */
  disabled?: boolean;
  /** Show one time donation tab */
  disableOneTimeDonationTab?: boolean;
}

const props = withDefaults(defineProps<ContributionProps>(), {
  showPeriod: true,
  showPaymentMethod: true,
  disabled: false,
  disableOneTimeDonationTab: true,
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
  // PaymentContent doesn't have periods, return empty array
  if (!('periods' in props.content)) {
    return [];
  }
  const selectedPeriod = props.content.periods.find((p) => {
    return p.name === period.value;
  });
  return selectedPeriod?.presetAmounts || [];
});

const periodItems = computed(() => {
  // PaymentContent doesn't have periods, return empty array
  if (!('periods' in props.content)) {
    return [];
  }
  // Remove one-time donation if disabled
  const filteredPeriods = props.disableOneTimeDonationTab
    ? props.content.periods.filter((p) => p.name !== 'one-time')
    : props.content.periods;

  return filteredPeriods.map((period) => ({
    label: t(`common.paymentPeriod.${period.name}`),
    value: period.name,
  }));
});

watch(isAnnually, (value) => {
  amount.value = value ? amount.value * 12 : Math.floor(amount.value / 12);
});

const shouldForceFee = computed(() => {
  return props.content.showAbsorbFee && amount.value === 1 && isAnnually.value;
});

watch(shouldForceFee, (force) => {
  if (force) payFee.value = true;
});

// Watch for when one-time donation is disabled and switch to monthly if currently selected
watch(
  () => props.disableOneTimeDonationTab,
  (disabled) => {
    if (disabled && period.value === 'one-time') {
      // Switch to monthly as default when one-time is disabled
      period.value = ContributionPeriod.Monthly;
    }
  }
);
</script>
