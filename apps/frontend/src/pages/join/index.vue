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
  <AuthBox v-if="generalContent.hideContribution">
    <template v-if="!isEmbed">
      <AppTitle>{{ joinContent.title }}</AppTitle>
      <div class="content-message mb-6" v-html="joinContent.subtitle" />
    </template>

    <JoinFormEmailOnly />
  </AuthBox>

  <AuthBox v-else :title="joinContent.title">
    <template #header>
      <div class="content-message" v-html="joinContent.subtitle" />
    </template>

    <div class="mb-6 flex items-end gap-px text-xs font-bold">
      <button
        v-for="(step, i) in steps"
        :key="i"
        class="group flex-1 text-center"
        :disabled="currentStep < i"
        @click="goToStep(i)"
      >
        <div
          class="px-2 pb-2"
          :class="currentStep === i ? 'text-link' : 'text-body-60'"
        >
          {{ step }}
        </div>
        <div
          class="h-2 group-first:rounded-l group-last:rounded-r"
          :class="currentStep >= i ? 'bg-link-70' : 'bg-primary-10'"
        />
      </button>
    </div>

    <template v-if="currentStep > 0">
      <div class="mb-4 flex items-center gap-4 rounded bg-primary-5 p-4">
        <font-awesome-icon
          :icon="faHandSparkles"
          class="text-primary-40"
          size="2x"
        />
        <span class="font-semibold">
          {{
            t('joinPayment.willBeContributing', { contribution: description })
          }}
        </span>
      </div>
      <p
        v-if="paymentContent.taxRateEnabled"
        class="-mt-2 mb-4 text-right text-xs"
      >
        {{ t('join.tax.included', { taxRate: paymentContent.taxRate }) }}
      </p>
    </template>

    <JoinFormStep1
      v-if="currentStep === 0"
      v-model:amount="data.amount"
      v-model:period="data.period"
      :join-content="joinContent"
      :payment-content="paymentContent"
      @submit="() => goToStep(1)"
    />
    <JoinFormStep2
      v-else-if="currentStep === 1"
      v-model:email="data.email"
      v-model:payment-method="data.paymentMethod"
      v-model:pay-fee="data.payFee"
      :data="data"
      :fee="fee"
      :join-content="joinContent"
      @submit="() => goToStep(2)"
    />
    <JoinFormStep3
      v-else-if="currentStep === 2"
      :email="data.email"
      :stripe-client-secret="stripeClientSecret"
      :stripe-public-key="paymentContent.stripePublicKey"
    />
  </AuthBox>
</template>

<script lang="ts" setup>
import {
  calcPaymentFee,
  ContributionPeriod,
  PaymentMethod,
  type ContentJoinData,
  type ContentPaymentData,
} from '@beabee/beabee-common';
import { computed, onBeforeMount, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import JoinFormStep1 from '@components/pages/join/JoinFormStep1.vue';

import { fetchContent } from '@utils/api/content';

import { generalContent, isEmbed } from '@store';

import AuthBox from '@components/AuthBox.vue';
import JoinFormStep3 from '@components/pages/join/JoinFormStep3.vue';
import JoinFormStep2 from '@components/pages/join/JoinFormStep2.vue';
import { faHandSparkles } from '@fortawesome/free-solid-svg-icons';
import AppTitle from '@components/AppTitle.vue';
import JoinFormEmailOnly from '@components/pages/join/JoinFormEmailOnly.vue';
import { signUpWithContribution } from '@utils/api/signup';

const { t, n } = useI18n();

const route = useRoute();

const steps = computed(() => [
  'Your contribution',
  'Payment method',
  'Payment data',
]);

const currentStep = ref(0);
const stripeClientSecret = ref('');

const joinContent = ref<ContentJoinData>({
  initialAmount: 5,
  initialPeriod: ContributionPeriod.Monthly,
  minMonthlyAmount: 5,
  presetAmounts: {
    [ContributionPeriod.Monthly]: [],
    [ContributionPeriod.Annually]: [],
  },
  showAbsorbFee: true,
  showNoContribution: false,
  subtitle: '',
  title: '',
  paymentMethods: [],
  stripeCountry: 'eu',
  stripePublicKey: '',
});

const paymentContent = ref<ContentPaymentData>({
  stripePublicKey: '',
  stripeCountry: 'eu',
  taxRateEnabled: false,
  taxRate: 7,
});

const data = reactive({
  email: '',
  amount: 5,
  period: ContributionPeriod.Monthly,
  payFee: true,
  prorate: false,
  paymentMethod: PaymentMethod.StripeCard,
});

const fee = computed(() =>
  calcPaymentFee(data, paymentContent.value.stripeCountry)
);

const description = computed(() => {
  const totalAmount = data.amount + (data.payFee ? fee.value : 0);

  return (
    n(totalAmount, 'currency') +
    ' ' +
    (data.period === ContributionPeriod.Monthly
      ? t('common.perMonthText')
      : t('common.perYearText'))
  );
});

async function goToStep(step: number) {
  if (currentStep.value === step) return;

  if (step === 2) {
    const ret = await signUpWithContribution(data);
    if (ret.clientSecret) {
      stripeClientSecret.value = ret.clientSecret;
      currentStep.value = 2;
    } else if (ret.redirectUrl) {
      (window.top || window).location.href = ret.redirectUrl;
    }
  } else {
    currentStep.value = step;
  }
}

onBeforeMount(async () => {
  joinContent.value = await fetchContent('join');
  paymentContent.value = await fetchContent('payment');

  data.amount =
    (route.query.amount && Number(route.query.amount)) ||
    joinContent.value.initialAmount;

  const period = route.query.period as ContributionPeriod;
  data.period = Object.values(ContributionPeriod).includes(period)
    ? period
    : joinContent.value.initialPeriod;

  data.paymentMethod = joinContent.value.paymentMethods[0];

  if (!joinContent.value.showAbsorbFee) {
    data.payFee = false;
  }
});
</script>
