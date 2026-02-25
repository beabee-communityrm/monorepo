<template>
  <AppForm full-button :button-text="buttonText" @submit.prevent="handleSubmit">
    <slot />
  </AppForm>

  <AppModal v-if="showModal" open :title="title" class="w-full" @close="reset">
    <p v-if="!stripeHasLoaded" class="p-4 text-center">
      <font-awesome-icon
        class="text-[50px] text-body-60"
        :icon="faCircleNotch"
        spin
      />
    </p>
    <StripePaymentForm
      :public-key="stripePublicKey"
      :payment-data="flowData"
      :return-url="completeUrl"
      :confirm-flow="handleStripeConfirm"
      @completed="handleStripeCompleted"
      @loaded="stripeHasLoaded = true"
    />
  </AppModal>

  <AppModal
    v-if="paymentFlowId"
    open
    no-close
    :title="t('common.loading')"
    class="w-full"
  >
    <p class="p-4 text-center">
      <font-awesome-icon
        class="text-[50px] text-body-60"
        :icon="faCircleNotch"
        spin
      />
    </p>
  </AppModal>
</template>

<script setup lang="ts">
import {
  type PaymentFlowParams,
  type PaymentFlowResult,
  PaymentMethod,
} from '@beabee/beabee-common';
import { AppForm, AppModal, addNotification } from '@beabee/vue';

import StripePaymentForm from '@components/forms/StripePaymentForm.vue';
import env from '@env';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import type { PaymentFlowFormData } from '@type/payment-flow-form-data';
import { extractErrorText } from '@utils/api-error';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();

const route = useRoute();
const router = useRouter();

const props = defineProps<{
  /** A site-wide unique identifier for the form */
  id: string;
  /** The text to display on the form's submit button */
  buttonText: string;
  /** The title to display on the form's modal */
  title: string;
  /** The Stripe public key to use for payment processing */
  stripePublicKey: string;
  /** The payment data to use for the payment flow */
  flowData: PaymentFlowFormData;
  /** A method which calls the API to start a payment flow*/
  startFlow: (params: PaymentFlowParams) => Promise<PaymentFlowResult>;
  /** A method which calls the API to complete a payment flow */
  completeFlow: (paymentFlowId: string) => Promise<void>;
}>();

/**
 * Show a spinner until the Stripe Elements form has loaded
 */
const stripeHasLoaded = ref(false);
const showModal = ref(false);

/**
 * The URL to return to after completing the payment flow. The page will return
 * to the same URL, but with the unique form ID and payment provider details
 * attached
 */
const completeUrl = computed(() => {
  const path = router.resolve({ query: { ...route.query, formId: props.id } });
  return `${env.appUrl}${path.href}`;
});

/**
 * The external payment flow ID to use to complete the payment flow. Use the
 * form ID to ensure that this is the correct instance of PaymentFlowForm to use
 * for completing the flow. This allows multiple instances of PaymentFlowForm to
 * exist on the same page.
 */
const paymentFlowId = computed(
  () =>
    // Check if this is the target form
    route.query.formId === props.id &&
    // GoCardless redirect flow param
    (route.query.redirect_flow_id?.toString() ||
      // Stripe SetupIntent param
      route.query.setup_intent?.toString())
);

/**
 * Starts the payment flow and handles the response. A payment flow
 * can trigger one of:
 * - An redirect to an off-site payment confirmation page (e.g. GoCardless)
 * - An inline payment flow (using Stripe)
 * - No further action
 */
async function handleSubmit() {
  if (props.flowData.paymentMethod === PaymentMethod.GoCardlessDirectDebit) {
    const data = await props.startFlow({
      paymentMethod: PaymentMethod.GoCardlessDirectDebit,
      completeUrl: completeUrl.value,
    });
    if (data.type === 'gocardless') {
      window.location.href = data.redirectUrl;
    }
  } else {
    showModal.value = true;
  }
}

async function handleStripeConfirm(
  token: string,
  firstName: string,
  lastName: string
) {
  // Shouldn't be possible
  if (props.flowData.paymentMethod === PaymentMethod.GoCardlessDirectDebit) {
    return;
  }

  const data = await props.startFlow({
    paymentMethod: props.flowData.paymentMethod,
    token,
    firstName,
    lastName,
  });
  if (data.type === 'stripe') {
    return data.clientSecret;
  }
}

async function handleStripeCompleted() {
  // TODO: handle success
}

/**
 * Resets the form state
 */
function reset() {
  showModal.value = false;
  stripeHasLoaded.value = false;
}

/**
 * Completes the payment flow when redirected back to the form.
 */
onBeforeMount(async () => {
  reset();

  if (paymentFlowId.value) {
    try {
      await props.completeFlow(paymentFlowId.value);
    } catch (err) {
      addNotification({
        variant: 'error',
        title: extractErrorText(err),
      });
    }

    router.replace({
      query: {
        ...route.query,
        formId: undefined,
        // GoCardless redirect flow param
        redirect_flow_id: undefined,
        // Stripe SetupIntent params
        setup_intent: undefined,
        setup_intent_client_secret: undefined,
        redirect_status: undefined,
      },
    });
  }
});
</script>
