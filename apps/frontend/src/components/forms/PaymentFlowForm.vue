<template>
  <AppApiForm
    full-button
    :button-text="buttonText"
    @submit.prevent="handleSubmit"
  >
    <slot />
  </AppApiForm>

  <AppModal
    v-if="paymentFlowId"
    open
    :title="title"
    class="w-full"
    @close="reset"
  >
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
      @loaded="stripeHasLoaded = true"
    />
  </AppModal>

  <AppModal
    v-if="completePaymentFlowId"
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
  type PaymentFlowAdvanceParams,
  type PaymentFlowSetupParams,
  type PaymentFlowSetupResult,
} from '@beabee/beabee-common';
import { AppModal, addNotification } from '@beabee/vue';

import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import AppApiForm from '#components/forms/AppApiForm.vue';
import StripePaymentForm from '#components/forms/StripePaymentForm.vue';
import env from '#env';
import type { PaymentFlowFormData } from '#type/payment-flow-form-data';
import { extractErrorText } from '#utils/api-error';

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
  startFlow: (
    params: PaymentFlowSetupParams
  ) => Promise<PaymentFlowSetupResult>;
  /** A method which calls the API to finalize a payment flow */
  completeFlow: (
    paymentFlowId: string,
    params?: PaymentFlowAdvanceParams
  ) => Promise<void>;
}>();

/**
 * Show a spinner until the Stripe Elements form has loaded
 */
const stripeHasLoaded = ref(false);
const paymentFlowId = ref<string | null>(null);

/**
 * The URL to return to after completing the payment flow. The page will return
 * to the same URL, but with the unique form ID and payment provider details
 * attached
 */
const completeUrl = computed(() => {
  const path = router.resolve({
    query: { ...route.query, formId: props.id },
  });
  return `${env.appUrl}${path.href}`;
});

/**
 * Starts the payment flow and handles the response. A payment flow
 * can trigger one of:
 * - An redirect to an off-site payment confirmation page (e.g. GoCardless)
 * - An inline payment flow (using Stripe)
 */
async function handleSubmit() {
  const data = await props.startFlow({
    paymentMethod: props.flowData.paymentMethod,
    completeUrl: completeUrl.value,
  });

  if (data.redirectUrl) {
    window.location.href = data.redirectUrl;
  } else {
    paymentFlowId.value = data.id;
  }
}

async function handleStripeConfirm(
  token: string,
  firstname: string,
  lastname: string
) {
  if (!paymentFlowId.value) return; // Not possible

  await props.completeFlow(paymentFlowId.value, {
    paymentFlowId: paymentFlowId.value,
    token,
    firstname,
    lastname,
  });

  paymentFlowId.value = null;
}

/**
 * Resets the form state
 */
function reset() {
  paymentFlowId.value = null;
  stripeHasLoaded.value = false;
}

/**
 * The payment flow ID to use to complete the payment flow. Use the form ID to
 * ensure that this is the correct instance of PaymentFlowForm to use for
 * completing the flow. This allows multiple instances of PaymentFlowForm to
 * exist on the same page.
 */
const completePaymentFlowId = computed(
  () =>
    // Check if this is the target form
    route.query.formId === props.id &&
    // Get the payment flow Id
    route.query.paymentFlowId?.toString()
);

/**
 * Completes the payment flow when redirected back to the form.
 */
onBeforeMount(async () => {
  reset();

  if (completePaymentFlowId.value) {
    try {
      await props.completeFlow(completePaymentFlowId.value);
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
        paymentFlowId: undefined,
        // Clear GoCardless redirect flow param
        redirect_flow_id: undefined,
        // Clear Stripe SetupIntent params
        setup_intent: undefined,
        setup_intent_client_secret: undefined,
        redirect_status: undefined,
      },
    });
  }
});
</script>
