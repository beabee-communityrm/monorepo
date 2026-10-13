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

  <div v-if="showVatNumber" class="mb-3">
    <AppLabel :label="t('form.vatNumber')" class="font-normal" />
    <AppInput v-model="vatNumber" name="vatNumber" />
  </div>

  <div ref="divRef"></div>

  <AppNotification
    v-if="errorText"
    variant="error"
    class="mt-4"
    :title="errorText"
  />

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
import {
  ContributionPeriod,
  paymentMethodToStripeType,
} from '@beabee/beabee-common';
import { AppInput } from '@beabee/vue';
import { AppButton, AppLabel, AppNotification } from '@beabee/vue';

import type Stripe from '@stripe/stripe-js';
import type { ApplePayOption } from '@stripe/stripe-js/dist/stripe-js/elements/apple-pay';
import { loadStripe } from '@stripe/stripe-js/pure';
import useVuelidate from '@vuelidate/core';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import env from '#env';
import { generalContent } from '#store';
import type { PaymentFlowFormData } from '#type/payment-flow-form-data';

const emit = defineEmits<{
  (event: 'loaded'): void;
  // (event: 'completed'): void;
}>();

const props = defineProps<{
  publicKey: string;
  paymentData: PaymentFlowFormData;
  returnUrl: string;
  confirmFlow: (
    token: string,
    firstName: string,
    lastName: string,
    vatNumber: string
  ) => Promise<void>;
  showNameFields?: boolean;
  showVatNumber?: boolean;
}>();

const { t } = useI18n();

const divRef = ref<HTMLElement>();
const paymentReady = ref(false);
const loading = ref(false);
const errorText = ref('');

const firstName = ref('');
const lastName = ref('');
const vatNumber = ref('');

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

const appearance: Stripe.Appearance = {
  theme: 'flat',
  variables: {
    colorDanger: getColor('--c-danger'),
    colorPrimary: getColor('--c-main'),
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
      border: '1px solid ' + getColor('--c-main-40'),
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

function handleError(err: Stripe.StripeError) {
  errorText.value =
    err.message &&
    (err.type === 'card_error' || err.type === 'validation_error')
      ? (errorText.value = err.message)
      : t('joinPayment.genericError', { type: err.type });
  loading.value = false;
}

onBeforeMount(async () => {
  const stripe = await loadStripe(props.publicKey);
  if (stripe && divRef.value) {
    const elements = stripe.elements({
      // TODO: mode setup
      mode:
        props.paymentData.period === 'one-time' ? 'payment' : 'subscription',
      amount: props.paymentData.amount * 100,
      currency: generalContent.value.currencyCode.toLowerCase(),
      paymentMethodCreation: 'manual',
      paymentMethodTypes: [
        paymentMethodToStripeType(props.paymentData.paymentMethod),
      ],
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

      const { error: submitError } = await elements.submit();
      if (submitError) {
        handleError(submitError);
        return;
      }

      const result = await stripe.createConfirmationToken({
        elements,
        params: {
          return_url: props.returnUrl,
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
        handleError(result.error);
      } else {
        await props.confirmFlow(
          result.confirmationToken.id,
          firstName.value,
          lastName.value,
          vatNumber.value
        );
      }
      // if (clientSecret) {
      //   const { error: actionError } = await stripe.handleNextAction({
      //     clientSecret,
      //   });
      //   if (actionError) {
      //     handleError(actionError);
      //   } else {
      //     emit('completed');
      //   }
      // }
    };
  }
});
</script>
<style scoped>
.StripeElement {
  overflow: hidden;
}
</style>
