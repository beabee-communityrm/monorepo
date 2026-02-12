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
    v-if="!stripeClientSecret"
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
    :stripe-client-secret="stripeClientSecret"
    @back="stripeClientSecret = ''"
  />
</template>

<script lang="ts" setup>
import {
  type ContentJoinData,
  type ContentPaymentData,
  ContributionPeriod,
  PaymentMethod,
  type SignupData,
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

const stripeClientSecret = ref('');

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

async function submitStep1() {
  try {
    const clientData: SignupData = {
      email: formData.email,
      ...(formData.noContribution
        ? {}
        : formData.period === 'one-time'
          ? {
              oneTimePayment: {
                amount: formData.amount,
                paymentMethod: formData.paymentMethod,
                payFee: formData.payFee,
                completeUrl: client.signup.completeUrl,
              },
            }
          : {
              contribution: {
                amount: formData.amount,
                period: formData.period,
                paymentMethod: formData.paymentMethod,
                payFee:
                  formData.period === ContributionPeriod.Monthly &&
                  formData.payFee,
                prorate: false,
                completeUrl: client.signup.completeUrl,
              },
            }),
    };

    const data = await client.signup.start(clientData);
    const topWindow = window.top || window;
    if (data?.redirectUrl) {
      topWindow.location.href = data.redirectUrl;
    } else if (data?.clientSecret) {
      stripeClientSecret.value = data.clientSecret;
    } else {
      if (isEmbed) {
        topWindow.location.href = '/join/confirm-email';
      } else {
        router.push({ path: '/join/confirm-email' });
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

onBeforeMount(async () => {
  stripeClientSecret.value = '';

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
