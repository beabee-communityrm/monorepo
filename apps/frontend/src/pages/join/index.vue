<route lang="yaml">
name: join
meta:
  layout: Auth
  noAuth: true
  pageTitle: pageTitle.join
  embeddable: true
  noCnrMode: true
</route>
<template>
  <JoinFormStep1
    v-if="!showStripeStep"
    v-model="formData"
    :join-content="joinContent"
    :payment-content="paymentContent"
    @submit.prevent="handleSubmitStep1"
  />

  <JoinFormStep2
    v-else
    v-model="formData"
    :join-content="joinContent"
    :payment-content="paymentContent"
    :confirm-flow="handleStripeConfirmFlow"
    @back="showStripeStep = false"
    @completed="goToConfirmEmailPage"
  />
</template>

<script lang="ts" setup>
import {
  type ContentJoinData,
  type ContentPaymentData,
  ContributionPeriod,
  type PaymentFlowParams,
  PaymentMethod,
} from '@beabee/beabee-common';
import { isApiError } from '@beabee/client';

import JoinFormStep1 from '@components/pages/join/JoinFormStep1.vue';
import JoinFormStep2 from '@components/pages/join/JoinFormStep2.vue';
import { generalContent, isEmbed } from '@store';
import type { JoinFormData } from '@type/join-form-data';
import { client } from '@utils/api';
import { notifyRateLimited } from '@utils/api-error';
import { onBeforeMount, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const showStripeStep = ref(false);

const joinContent = ref<ContentJoinData>({
  initialAmount: 5,
  initialPeriod: ContributionPeriod.Monthly,
  minMonthlyAmount: 5,
  periods: [],
  showAbsorbFee: true,
  showNoContribution: false,
  subtitle: '',
  title: '',
  paymentMethods: [],
  stripePublicKey: '',
  stripeCountry: 'eu',
});

const paymentContent = ref<ContentPaymentData>({
  stripePublicKey: '',
  stripeCountry: 'eu',
  taxRateRecurring: null,
  taxRateOneTime: null,
  noticeText: '',
  showOneTimeDonation: false,
});

const formData = reactive<JoinFormData>({
  email: '',
  amount: 5,
  period: ContributionPeriod.Monthly,
  payFee: true,
  prorate: false,
  paymentMethod: PaymentMethod.StripeCard,
  noContribution: false,
});

function goToConfirmEmailPage() {
  const topWindow = window.top || window;
  if (isEmbed) {
    topWindow.location.href = '/join/confirm-email';
  } else {
    router.push({ path: '/join/confirm-email' });
  }
}

async function startSignupFlow(params: PaymentFlowParams) {
  return await client.signup.start({
    email: formData.email,
    ...(formData.period === 'one-time'
      ? {
          oneTimePayment: {
            amount: formData.amount,
            payFee: formData.payFee,
            params,
          },
        }
      : {
          contribution: {
            amount: formData.amount,
            period: formData.period,
            payFee:
              formData.period === ContributionPeriod.Monthly && formData.payFee,
            prorate: false,
            params,
          },
        }),
  });
}

async function handleSubmitStep1() {
  try {
    if (formData.noContribution) {
      await client.signup.start({ email: formData.email });
      goToConfirmEmailPage();
    } else if (formData.paymentMethod === PaymentMethod.GoCardlessDirectDebit) {
      const data = await startSignupFlow({
        paymentMethod: PaymentMethod.GoCardlessDirectDebit,
        completeUrl: client.signup.completeUrl,
      });
      if (!data?.redirectUrl) return; // Can't happen for GC flows

      const topWindow = window.top || window;
      topWindow.location.href = data.redirectUrl;
    } else {
      showStripeStep.value = true;
    }
  } catch (err) {
    if (isApiError(err, undefined, [429])) {
      notifyRateLimited(err);
      return;
    }
    throw err;
  }
}

async function handleStripeConfirmFlow(
  token: string,
  firstname: string,
  lastname: string
) {
  // GC flows can't get here
  if (formData.paymentMethod === PaymentMethod.GoCardlessDirectDebit) {
    return;
  }

  try {
    await startSignupFlow({
      paymentMethod: formData.paymentMethod,
      token,
      firstname,
      lastname,
    });

    await client.signup.complete({ paymentFlowId: token });

    goToConfirmEmailPage();
  } catch (err) {
    if (isApiError(err, undefined, [429])) {
      notifyRateLimited(err);
      return;
    }
    throw err;
  }
}

onBeforeMount(async () => {
  showStripeStep.value = false;

  joinContent.value = await client.content.get('join');
  paymentContent.value = await client.content.get('payment');

  formData.amount =
    (route.query.amount && Number(route.query.amount)) ||
    joinContent.value.initialAmount;

  const period = route.query.period as ContributionPeriod | 'one-time';
  formData.period =
    period === 'one-time' || Object.values(ContributionPeriod).includes(period)
      ? period
      : joinContent.value.initialPeriod;

  formData.paymentMethod = joinContent.value.paymentMethods[0];

  if (!joinContent.value.showAbsorbFee) {
    formData.payFee = false;
  }

  if (generalContent.value.hideContribution) {
    formData.noContribution = true;
  }
});
</script>
