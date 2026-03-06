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
    v-if="!showStep2"
    v-model="formData"
    :join-content="joinContent"
    :payment-content="paymentContent"
    @submit.prevent="submitStep1"
  />

  <JoinFormStep2
    v-else
    v-model="formData"
    :join-content="joinContent"
    :payment-content="paymentContent"
    :confirm-flow="startStripeSignup"
    @back="showStep2 = false"
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
  type SignupData,
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

const showStep2 = ref(false);

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

async function startNoContributionSignup() {
  try {
    await client.signup.start({ email: formData.email });
    goToConfirmEmailPage();
  } catch (err) {
    if (isApiError(err, undefined, [429])) {
      notifyRateLimited(err);
      return;
    }
    throw err;
  }
}

async function startSignupFlow(paymentFlowParams: PaymentFlowParams) {
  const clientData: SignupData = {
    email: formData.email,
    ...(formData.period === 'one-time'
      ? {
          oneTimePayment: {
            amount: formData.amount,
            // paymentMethod: formData.paymentMethod,
            payFee: formData.payFee,
            ...paymentFlowParams,
          },
        }
      : {
          contribution: {
            amount: formData.amount,
            period: formData.period,
            // paymentMethod: formData.paymentMethod,
            payFee:
              formData.period === ContributionPeriod.Monthly && formData.payFee,
            prorate: false,
            ...paymentFlowParams,
          },
        }),
  };

  try {
    const data = await client.signup.start(clientData);
    const topWindow = window.top || window;
    if (data?.redirectUrl) {
      topWindow.location.href = data.redirectUrl;
    } else if (data?.clientSecret) {
      return data.clientSecret;
    } else {
      goToConfirmEmailPage();
    }
  } catch (err) {
    if (isApiError(err, undefined, [429])) {
      notifyRateLimited(err);
      return;
    }
    throw err;
  }
}

async function submitStep1() {
  if (formData.noContribution) {
    await startNoContributionSignup();
  } else if (formData.paymentMethod === PaymentMethod.GoCardlessDirectDebit) {
    await startSignupFlow({
      paymentMethod: PaymentMethod.GoCardlessDirectDebit,
      completeUrl: client.signup.completeUrl,
    });
  } else {
    showStep2.value = true;
  }
}

async function startStripeSignup(
  token: string,
  firstname: string,
  lastname: string
) {
  // Shouldn't be possible
  if (formData.paymentMethod === PaymentMethod.GoCardlessDirectDebit) {
    return;
  }

  return await startSignupFlow({
    paymentMethod: formData.paymentMethod,
    completeUrl: token,
    firstname,
    lastname,
  });
}

onBeforeMount(async () => {
  showStep2.value = false;

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
