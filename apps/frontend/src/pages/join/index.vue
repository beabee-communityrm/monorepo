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
  <JoinForm
    v-if="!stripeClientSecret"
    :join-content="joinContent"
    :payment-content="paymentContent"
    @submit.prevent="submitSignUp"
  />

  <AuthBox v-else :title="joinContent.title">
    <template #header>
      <div class="content-message" v-html="joinContent.subtitle" />
    </template>

    <AppNotification
      variant="info"
      :title="t('joinPayment.willBeContributing', signUpDescription)"
      :icon="faHandSparkles"
      class="mb-4"
    />
    <p
      v-if="paymentContent.taxRateEnabled"
      class="-mt-2 mb-4 text-right text-xs"
    >
      {{ t('join.tax.included', { taxRate: paymentContent.taxRate }) }}
    </p>

    <p class="mb-3 text-xs font-semibold text-body-80">
      {{ t('joinPayment.note') }}
    </p>
    <p class="mb-6 text-xs font-semibold text-body-80">
      <i18n-t keypath="joinPayment.goBack">
        <template #back>
          <a
            class="cursor-pointer text-link underline"
            @click="stripeClientSecret = ''"
          >
            {{ t('joinPayment.goBackButton') }}
          </a>
        </template>
      </i18n-t>
    </p>

    <StripePayment
      :client-secret="stripeClientSecret"
      :public-key="paymentContent.stripePublicKey"
      :payment-data="signUpData"
      :return-url="client.signup.completeUrl"
      show-name-fields
    />
  </AuthBox>
</template>

<script lang="ts" setup>
import {
  ContributionPeriod,
  type ContentJoinData,
  type ContentPaymentData,
} from '@beabee/beabee-common';
import { onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import StripePayment from '@components/StripePayment.vue';
import { useJoin } from '@components/pages/join/use-join';
import JoinForm from '@components/pages/join/JoinForm.vue';
import { faHandSparkles } from '@fortawesome/free-solid-svg-icons';
import { AppNotification } from '@beabee/vue/components';
import AuthBox from '@components/AuthBox.vue';

import { client } from '@utils/api';

import { generalContent, isEmbed } from '@store';

const { t } = useI18n();

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
});

const { signUpData, signUpDescription } = useJoin(paymentContent);

async function submitSignUp() {
  const data = await client.signup.start(signUpData);
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
