<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <AppChoice
    v-if="showPeriod"
    v-model="periodProxy"
    :items="
      content.periods.map((period) => ({
        label: t('common.contributionPeriod.' + period.name),
        value: period.name,
      }))
    "
    :disabled="disabled"
    class="mb-4"
  />

  <VueContribution
    v-model:amount="amountProxy"
    v-model:period="periodProxy"
    v-model:pay-fee="payFeeProxy"
    v-model:payment-method="paymentMethodProxy"
    :content="content"
    :payment-content="paymentContent"
    :show-period="false"
    :show-payment-method="showPaymentMethod"
    :disabled="disabled"
    :currency-symbol="generalContent.currencySymbol"
    :currency-formatter="(amount: number) => n(amount, 'currency')"
    class="mb-4"
  >
    <slot></slot>
  </VueContribution>
</template>

<script lang="ts" setup>
import {
  type ContentPaymentData,
  ContributionPeriod,
  PaymentMethod,
} from '@beabee/beabee-common';
import { AppChoice, type ContributionContent } from '@beabee/vue';

import { generalContent } from '@store';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import VueContribution from './VueContribution.vue';

const props = withDefaults(
  defineProps<{
    amount: number;
    period: ContributionPeriod;
    payFee: boolean;
    paymentMethod?: PaymentMethod;
    content: ContributionContent;
    paymentContent: ContentPaymentData;
    showPeriod?: boolean;
    showPaymentMethod?: boolean;
    disabled?: boolean;
  }>(),
  {
    showPeriod: true,
    showPaymentMethod: true,
    disabled: false,
    paymentMethod: PaymentMethod.StripeCard,
  }
);

const { t, n } = useI18n();

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
  get: () => props.paymentMethod || PaymentMethod.StripeCard,
  set: (paymentMethod) => emit('update:paymentMethod', paymentMethod),
});

const isMonthly = computed(
  () => periodProxy.value === ContributionPeriod.Monthly
);

watch(isMonthly, (value) => {
  amountProxy.value = value
    ? Math.floor(amountProxy.value / 12)
    : amountProxy.value * 12;
});
</script>
