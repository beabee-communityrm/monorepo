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
import useVuelidate from '@vuelidate/core';
import { type Appearance } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppButton from './button/AppButton.vue';
import AppInput from './forms/AppInput.vue';
import AppLabel from './forms/AppLabel.vue';

import theme from 'virtual:theme';
import AppNotification from './AppNotification.vue';

const emit = defineEmits(['loaded']);

const props = defineProps<{
  clientSecret: string;
  publicKey: string;
  email: string;
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

// eslint-disable-next-line @typescript-eslint/no-empty-function
let completePayment = ref(() => {});

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
          ...(props.showNameFields && {
            name: 'never',
          }),
        },
      },
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
              email: props.email,
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
            : t('joinPayment.genericError');
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
