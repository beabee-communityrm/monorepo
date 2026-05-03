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
import { PaymentRequiresActionError } from '@beabee/client';
import { AppInput } from '@beabee/vue';
import { AppButton, AppLabel, AppNotification } from '@beabee/vue';

import type Stripe from '@stripe/stripe-js';
import type { ApplePayOption } from '@stripe/stripe-js/dist/stripe-js/elements/apple-pay';
import { loadStripe } from '@stripe/stripe-js/pure';
import useVuelidate from '@vuelidate/core';
import theme from 'virtual:theme';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import env from '#env';
import { generalContent } from '#store';
import type { PaymentFlowFormData } from '#type/payment-flow-form-data';
import { extractErrorText } from '#utils/api-error';

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
    lastName: string
  ) => Promise<void>;
  showNameFields?: boolean;
}>();

const { t } = useI18n();

const divRef = ref<HTMLElement>();
const paymentReady = ref(false);
const loading = ref(false);
const errorText = ref('');

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

const appearance: Stripe.Appearance = {
  theme: 'flat',
  variables: {
    colorDanger: getColor('--c-danger'),
    colorPrimary: getColor('-c--primary'),
    colorText: getColor('--c-body'),
    colorBackground: getColor('--c-white'),
    borderRadius: theme.borderRadius.DEFAULT,
    fontLineHeight: theme.lineHeight.tight,
    fontSizeBase: theme.fontSize.base[0],
    fontSizeSm: theme.fontSize.sm[0],
    fontSizeXs: theme.fontSize.xs[0],
    fontFamily: style.getPropertyValue('--ff-body'),
  },
  rules: {
    '.Input': {
      border: '1px solid ' + getColor('--c-primary-40'),
      padding: theme.spacing['2'],
      lineHeight: theme.lineHeight.tight,
    },
    '.Input:focus': {
      boxShadow: style.getPropertyValue('--bs-input'),
    },
    '.Input--invalid': {
      backgroundColor: getColor('--c-danger-10'),
      borderColor: getColor('--c-danger-70'),
      color: 'inherit',
      boxShadow: 'none',
    },
    '.Label': {
      fontSize: theme.fontSize.base[0],
      marginBottom: theme.spacing['1.5'],
    },
    '.Error': {
      fontSize: theme.fontSize.xs[0],
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

function handleStripeError(err: Stripe.StripeError) {
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
        handleStripeError(submitError);
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
        handleStripeError(result.error);
        return;
      }

      try {
        await props.confirmFlow(
          result.confirmationToken.id,
          firstName.value,
          lastName.value
        );
      } catch (err) {
        if (err instanceof PaymentRequiresActionError) {
          const { error: actionError } = await stripe.handleNextAction({
            clientSecret: err.clientSecret,
          });
          if (actionError) {
            handleStripeError(actionError);
          } else {
            console.log('success??');
          }
        } else {
          errorText.value = extractErrorText(err);
          loading.value = false;
        }
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
