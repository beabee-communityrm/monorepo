<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <ContributionPeriodVue
    v-if="showPeriod"
    v-model="periodProxy"
    :disabled="disabled"
    class="mb-4"
  />

  <ContributionAmount
    v-model.number="amountProxy"
    :is-monthly="isMonthly"
    :min-amount="minAmount"
    :preset-amounts="content.presetAmounts[periodProxy]"
    :disabled="disabled"
    class="mb-4"
  />

  <slot></slot>

  <ContributionMethod
    v-if="showPaymentMethod"
    v-model="paymentMethodProxy"
    :methods="content.paymentMethods"
    :disabled="disabled"
    class="mb-4"
  />

  <ContributionFee
    v-if="isMonthly && content.showAbsorbFee"
    v-model="payFeeProxy"
    :amount="amountProxy"
    :fee="fee"
    :force="shouldForceFee"
    :disabled="disabled"
  />
</template>

<script lang="ts" setup>
import {
  calcPaymentFee,
  type ContentPaymentData,
  ContributionPeriod,
  PaymentMethod,
} from '@beabee/beabee-common';
import { computed, watch } from 'vue';
import ContributionAmount from './ContributionAmount.vue';
import ContributionFee from './ContributionFee.vue';
import ContributionMethod from './ContributionMethod.vue';
import { type ContributionContent } from './contribution.interface';
import ContributionPeriodVue from './ContributionPeriod.vue';

const props = withDefaults(
  defineProps<{
    amount: number;
    period: ContributionPeriod;
    payFee: boolean;
    paymentMethod: PaymentMethod;
    content: ContributionContent;
    paymentContent: ContentPaymentData;
    showPeriod?: boolean;
    showPaymentMethod?: boolean;
    disabled?: boolean;
  }>(),
  { showPeriod: true, showPaymentMethod: true, disabled: false }
);

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
</script>
