<template>
  <template v-if="showNameFields">
    <div class="mb-3">
      <AppLabel :label="t('form.firstName')" class="font-normal" />
      <AppInput v-model="firstName" name="firstName" required />
    </div>

    <div class="mb-3">
      <AppLabel :label="t('form.lastName')" class="font-normal" />
      <AppInput v-model="lastName" name="lastName" required />
    </div>
  </template>

  <div ref="divRef"></div>

  <AppNotification v-if="error" variant="error" class="mt-4" :title="error" />

  <AppButton
    :disabled="!paymentReady || validation.$invalid"
    :loading="loading"
    variant="link"
    type="submit"
    class="mt-4 w-full"
    @click="completePayment"
    >{{ t('actions.continue') }}</AppButton
  >
</template>
<script lang="ts" setup>
import { ContributionPeriod } from '@beabee/beabee-common';
import { AppInput } from '@beabee/vue';
import { AppButton, AppLabel, AppNotification } from '@beabee/vue';

import type { Appearance } from '@stripe/stripe-js';
import type { ApplePayOption } from '@stripe/stripe-js/dist/stripe-js/elements/apple-pay';
import { loadStripe } from '@stripe/stripe-js/pure';
import useVuelidate from '@vuelidate/core';
import defaultTheme from 'tailwindcss/defaultTheme';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import env from '#env';
import type { PaymentFlowFormData } from '#type/payment-flow-form-data';

const emit = defineEmits(['loaded']);

const props = defineProps<{
  clientSecret: string;
  publicKey: string;
  paymentData: PaymentFlowFormData;
  returnUrl: string;
  showNameFields?: boolean;
}>();

const { t } = useI18n();

const divRef = ref<HTMLElement>();
const paymentReady = ref(false);
const loading = ref(false);
const error = ref('');

const firstName = ref('');
const lastName = ref('');

const validation = useVuelidate();

const completePayment = ref(() => {});

// Fetch dynamic theming options, tailwind wraps colours in rgb()
const style = getComputedStyle(document.body);
function getColor(name: string): string {
  const value = style.getPropertyValue(name);
  return `rgb(${value})`;
}

const appearance: Appearance = {
  theme: 'flat',
  variables: {
    colorDanger: getColor('--c-danger'),
    colorPrimary: getColor('-c--primary'),
    colorText: getColor('--c-body'),
    colorBackground: getColor('--c-white'),
    borderRadius: style.getPropertyValue('--radius'),

    fontLineHeight: style.getPropertyValue('--line-height-tight'),
    fontSizeBase: style.getPropertyValue('--font-size-base'),
    fontSizeSm: style.getPropertyValue('--font-size-sm'),
    fontSizeXs: style.getPropertyValue('--font-size-xs'),
    fontFamily: style.getPropertyValue('--ff-body'),
  },
  rules: {
    '.Input': {
      border: '1px solid ' + getColor('--c-primary-40'),
      padding: defaultTheme.spacing['2'],
      lineHeight: defaultTheme.lineHeight.tight,
    },
    '.Input:focus': {
      boxShadow: style.getPropertyValue('--shadow-input'),
    },
    '.Input--invalid': {
      backgroundColor: getColor('--c-danger-10'),
      borderColor: getColor('--c-danger-70'),
      color: 'inherit',
      boxShadow: 'none',
    },
    '.Label': {
      fontSize: defaultTheme.fontSize.base[0] as string,
      marginBottom: defaultTheme.spacing['1.5'],
    },
    '.Error': {
      fontSize: style.getPropertyValue('--font-size-xs'),
    },
  },
};

const applePayOption = computed<ApplePayOption | undefined>(() => {
  return props.paymentData.period !== 'one-time'
    ? {
        recurringPaymentRequest: {
          paymentDescription: t('paymentLabels.membershipProductName'),
          managementURL: env.appUrl + '/profile/contribution',
          regularBilling: {
            label: t('paymentLabels.recurringContribution'),
            amount: props.paymentData.amount * 100,
            recurringPaymentIntervalUnit:
              props.paymentData.period === ContributionPeriod.Monthly
                ? 'month'
                : 'year',
            recurringPaymentIntervalCount: 1,
          },
        },
      }
    : undefined;
});

onBeforeMount(async () => {
  const stripe = await loadStripe(props.publicKey);
  if (stripe && divRef.value) {
    const elements = stripe.elements({
      clientSecret: props.clientSecret,
      appearance,
    });
    const paymentElement = elements.create('payment', {
      fields: {
        billingDetails: {
          email: 'never',
          ...(props.showNameFields && { name: 'never' }),
        },
      },
      applePay: applePayOption.value,
    });
    paymentElement.mount(divRef.value);
    paymentElement.on('ready', () => emit('loaded'));
    paymentElement.on('change', (evt: { complete: boolean }) => {
      paymentReady.value = evt.complete;
    });

    completePayment.value = async () => {
      loading.value = true;
      const returnUrl =
        props.returnUrl +
        (props.showNameFields
          ? `?firstName=${encodeURIComponent(
              firstName.value
            )}&lastName=${encodeURIComponent(lastName.value)}`
          : '');
      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {
              email: props.paymentData.email,
              ...(props.showNameFields && {
                name: `${firstName.value} ${lastName.value}`,
              }),
            },
          },
        },
      });
      if (result.error) {
        loading.value = false;
        error.value =
          result.error.message &&
          (result.error.type === 'card_error' ||
            result.error.type === 'validation_error')
            ? (error.value = result.error.message)
            : t('joinPayment.genericError', { type: result.error.type });
      }
    };
  }
});
</script>
<style scoped>
.StripeElement {
  overflow: hidden;
}
</style>
