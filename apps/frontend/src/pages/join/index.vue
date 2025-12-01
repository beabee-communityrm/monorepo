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
    :join-content="joinContent"
    :payment-content="paymentContent"
    @submit.prevent="submitStep1"
  />

  <JoinFormStep2
    v-else
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
  type SignupData,
} from '@beabee/beabee-common';
import { isApiError } from '@beabee/client';

import JoinFormStep1 from '@components/pages/join/JoinFormStep1.vue';
import JoinFormStep2 from '@components/pages/join/JoinFormStep2.vue';
import { useJoin } from '@components/pages/join/use-join';
import { generalContent, isEmbed } from '@store';
import { client } from '@utils/api';
import { notifyRateLimited } from '@utils/api-error';
import { onBeforeMount, ref } from 'vue';
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
  taxRateEnabled: false,
  taxRate: 7,
  noticeText: '',
});

const { signUpData } = useJoin(paymentContent);

async function submitStep1() {
  try {
    const clientData: SignupData = {
      email: signUpData.email,
      ...(signUpData.noContribution
        ? {}
        : signUpData.period === 'one-time'
          ? {
              oneTimePayment: {
                amount: signUpData.amount,
                paymentMethod: signUpData.paymentMethod,
                payFee: signUpData.payFee,
                completeUrl: client.signup.completeUrl,
              },
            }
          : {
              contribution: {
                amount: signUpData.amount,
                period: signUpData.period,
                paymentMethod: signUpData.paymentMethod,
                payFee:
                  signUpData.period === ContributionPeriod.Monthly &&
                  signUpData.payFee,
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

  signUpData.amount =
    (route.query.amount && Number(route.query.amount)) ||
    joinContent.value.initialAmount;

  const period = route.query.period as ContributionPeriod;
  signUpData.period = Object.values(ContributionPeriod).includes(period)
    ? period
    : joinContent.value.initialPeriod;

  signUpData.paymentMethod = joinContent.value.paymentMethods[0];

  if (!joinContent.value.showAbsorbFee) {
    signUpData.payFee = false;
  }

  if (generalContent.value.hideContribution) {
    signUpData.noContribution = true;
  }
});
</script>
