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
    v-if="!paymentFlowId"
    v-model="formData"
    :join-content="joinContent"
    :payment-content="paymentContent"
    @submit="handleSubmitStep1"
  />

  <JoinFormStep2
    v-else
    v-model="formData"
    :join-content="joinContent"
    :payment-content="paymentContent"
    @submit="handleSubmitStep2"
    @back="paymentFlowId = null"
  />
</template>

<script lang="ts" setup>
import {
  type ContentJoinData,
  type ContentPaymentData,
  ContributionPeriod,
  PaymentMethod,
} from '@beabee/beabee-common';
import { isApiError } from '@beabee/client';

import { onBeforeMount, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import JoinFormStep1 from '#components/pages/join/JoinFormStep1.vue';
import JoinFormStep2 from '#components/pages/join/JoinFormStep2.vue';
import { generalContent, isEmbed } from '#store';
import type { JoinFormData } from '#type/join-form-data';
import { client } from '#utils/api';
import { notifyRateLimited } from '#utils/api-error';

const route = useRoute();
const router = useRouter();

const paymentFlowId = ref<string | null>(null);

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

async function startSignupWithPaymentFlow() {
  const params = {
    paymentMethod: formData.paymentMethod,
    completeUrl: client.signup.completeUrl,
  };

  const ret = await client.signup.start({
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
  if (!ret) throw new Error('Unexpected error'); // Can't happen for payment flows
  return ret;
}

async function handleSubmitStep1() {
  try {
    if (formData.noContribution) {
      await client.signup.start({ email: formData.email });
      goToConfirmEmailPage();
    } else {
      const data = await startSignupWithPaymentFlow();
      if (data.redirectUrl) {
        const topWindow = window.top || window;
        topWindow.location.href = data.redirectUrl;
      } else {
        paymentFlowId.value = data.id;
      }
    }
  } catch (err) {
    if (isApiError(err, undefined, [429])) {
      notifyRateLimited(err);
      return;
    }
    throw err;
  }
}

async function handleSubmitStep2(
  token: string,
  firstname: string,
  lastname: string
) {
  if (!paymentFlowId.value) return;

  try {
    // Advance the payment flow with token and user details
    await client.signup.advance(paymentFlowId.value, {
      token,
      firstname,
      lastname,
    });

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
  paymentFlowId.value = null;

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
