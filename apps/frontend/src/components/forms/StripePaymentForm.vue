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

function multiplyCssValue(cssValue: string, multiplier: number) {
  if (typeof cssValue !== 'string') {
    throw new Error('cssValue must be a string (e.g., "1rem", "16px").');
  }

  const trimmedValue = cssValue.trim();
  const match = trimmedValue.match(/^([-+]?\d*\.?\d+)([a-z%]*)$/i);

  if (!match) {
    return trimmedValue;
  }

  const numericPart = match[1];
  const unit = match[2] || '';

  const numericValue = parseFloat(numericPart);
  const result = numericValue * multiplier + unit;

  return result;
}

const appearance: Appearance = {
  theme: 'flat',
  variables: {
    colorDanger: getColor('--c-danger'),
    colorPrimary: getColor('-c--primary'),
    colorText: getColor('--c-body'),
    colorBackground: getColor('--c-white'),
    borderRadius: style.getPropertyValue('--radius'),

    fontLineHeight: style.getPropertyValue('--leading-tight'),
    fontSizeBase: style.getPropertyValue('--text-base'),
    fontSizeSm: style.getPropertyValue('--text-sm'),
    fontSizeXs: style.getPropertyValue('--text-xs'),
    fontFamily: style.getPropertyValue('--ff-body'),
  },
  rules: {
    '.Input': {
      border: '1px solid ' + getColor('--c-primary-40'),
      padding: multiplyCssValue(style.getPropertyValue('--spacing'), 2),
      lineHeight: style.getPropertyValue('--leading-tight'),
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
      fontSize: style.getPropertyValue('--text-base'),
      marginBottom: multiplyCssValue(style.getPropertyValue('--spacing'), 1.5),
    },
    '.Error': {
      fontSize: style.getPropertyValue('--text-xs'),
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
