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
    :labels="contributionLabels"
    class="mb-4"
  >
    <slot></slot>
  </VueContribution>

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
</template>

<script lang="ts" setup>
import {
  type ContentPaymentData,
  ContributionPeriod,
  PaymentMethod,
  calcPaymentFee,
} from '@beabee/beabee-common';
import { AppChoice, ContributionFee } from '@beabee/vue';
import { Contribution as VueContribution } from '@beabee/vue';

import { generalContent } from '@store';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { type ContributionContent } from './contribution.interface';

/**
 * Labels and text content for the Contribution component
 */
interface ContributionLabels {
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

const { t, n } = useI18n();

const fee = computed(() =>
  calcPaymentFee(props, props.paymentContent.stripeCountry)
);

// Create labels object for the vue package component
const contributionLabels = computed<ContributionLabels>(() => ({
  currencySymbol: generalContent.value.currencySymbol,
  minimumContribution: t('join.minimumContribution'),
  perMonth: t('common.perMonth'),
  perYear: t('common.perYear'),
  paymentMethodTitle: t('join.paymentMethod'),
  absorbFeeText: t('join.absorbFeeText', { fee: '{fee}' }),
  absorbFeeOptional: t('join.absorbFeeOptIn', {
    fee: '{fee}',
    amount: '{amount}',
  }),
  absorbFeeForced: t('join.absorbFeeForce', {
    fee: '{fee}',
    amount: '{amount}',
  }),
  periods: {
    monthly: t('common.contributionPeriod.monthly'),
    annually: t('common.contributionPeriod.annually'),
  },
  paymentMethods: {
    [PaymentMethod.StripeCard]: t('paymentMethods.stripe-card.label'),
    [PaymentMethod.StripeSEPA]: t('paymentMethods.stripe-sepa.label'),
    [PaymentMethod.StripeBACS]: t('paymentMethods.stripe-bacs.label'),
    [PaymentMethod.StripePayPal]: t('paymentMethods.stripe-paypal.label'),
    [PaymentMethod.StripeIdeal]: t('paymentMethods.stripe-ideal.label'),
    [PaymentMethod.GoCardlessDirectDebit]: t(
      'paymentMethods.gocardless-direct-debit.label'
    ),
  },
  currencyFormatter: (amount: number) => n(amount, 'currency'),
}));

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
  t('join.absorbFeeText', { fee: n(fee.value, 'currency') })
);

const absorbFeeLabel = computed(() =>
  t(shouldForceFee.value ? 'join.absorbFeeForce' : 'join.absorbFeeOptIn', {
    fee: n(fee.value, 'currency'),
    amount: n(amountProxy.value, 'currency'),
  })
);
</script>
