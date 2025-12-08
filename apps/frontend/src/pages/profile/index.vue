<route lang="yaml">
name: profile
meta:
  pageTitle: homePage.title
</route>

<template>
  <PageTitle :title="`${t('common.hello')} ${user.firstname}!`" no-collapse />

  <section
    v-if="showWelcomeMessage && profileContent.introMessage"
    class="mb-10"
  >
    <WelcomeMessage
      :first-name="user.firstname"
      :last-name="user.lastname"
      :text="profileContent.introMessage"
      @close="removeWelcomeMessage"
    />
  </section>

  <NoticeContainer class="mb-10 md:mb-12" />

  <section class="mb-8 md:hidden">
    <QuickActions />
  </section>

  <section v-if="callouts.length" class="mb-6 lg:mr-6">
    <SectionTitle>{{ t('homePage.openCallouts') }}</SectionTitle>

    <div class="-mx-3 my-6 flex flex-wrap">
      <CalloutCard
        v-for="callout in callouts"
        :key="callout.slug"
        :callout="callout"
        class="mx-3 mb-5"
      />
    </div>

    <AppButton to="/crowdnewsroom" variant="primaryOutlined">{{
      t('homePage.viewAllCallouts')
    }}</AppButton>
  </section>

  <section class="mb-6 lg:mr-6">
    <SectionTitle>{{ t('homePage.yourProfile') }}</SectionTitle>

    <div class="mb-4 flex">
      <ContributionInfo :contact="user" />
    </div>

    <AppButton
      v-if="!generalContent.hideContribution"
      to="/profile/contribution"
      variant="primaryOutlined"
      >{{ t('homePage.manageContribution') }}</AppButton
    >
  </section>
  <section
    v-if="paymentContent.showOneTimeDonation"
    class="mb-6 lg:mr-6 lg:w-1/4"
  >
    <form @submit.prevent="handleSubmitDonation">
      <SectionTitle>{{ t('homePage.makeOneTimeDonation') }}</SectionTitle>

      <AppContribution
        v-model:amount="oneTimeDonation.amount"
        v-model:period="oneTimeDonation.period"
        v-model:pay-fee="oneTimeDonation.payFee"
        v-model:payment-method="oneTimeDonation.paymentMethod"
        :content="content"
        :payment-content="paymentContent"
        :show-period="false"
      >
      </AppContribution>

      <!-- <AppNotification
      class="mb-4"
      variant="error"
      :title="t('contribution.contributionUpdateError')"
    /> -->

      <AppButton variant="link" class="mb-4 mt-4 w-full">
        Make a Donation
      </AppButton>
    </form>
  </section>
</template>

<script lang="ts" setup>
import {
  type ContentPaymentData,
  type ContentProfileData,
  type GetCalloutData,
  type GetContactData,
  ItemStatus,
  PaymentMethod,
  type PaymentPeriod,
} from '@beabee/beabee-common';
import { AppButton, PageTitle, WelcomeMessage } from '@beabee/vue';

import CalloutCard from '@components/callout/CalloutCard.vue';
import AppContribution from '@components/contribution/AppContribution.vue';
import ContributionInfo from '@components/pages/profile/ContributionInfo.vue';
import NoticeContainer from '@components/pages/profile/NoticeContainer.vue';
import QuickActions from '@components/pages/profile/QuickActions.vue';
import SectionTitle from '@components/pages/profile/SectionTitle.vue';
import { currentUser, generalContent } from '@store';
import type { OneTimePaymentContent } from '@type/one-time-payment-content';
import { client } from '@utils/api';
import { type Ref, onBeforeMount, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();

const hasWelcomeMessageQuery = useRoute().query.welcomeMessage === 'true';

const showWelcomeMessage = ref(hasWelcomeMessageQuery);

const removeWelcomeMessage = () => {
  showWelcomeMessage.value = false;
};

const profileContent = ref<ContentProfileData>({
  introMessage: '',
});

// const stripeClientSecret = ref('');

const callouts = ref<GetCalloutData[]>([]);

// This page is behind auth so currentUser can't be null
// TODO: is there a nicer way to handle this?
const user = currentUser as Ref<GetContactData>;

const content = ref<OneTimePaymentContent>({
  initialAmount: 5,
  minMonthlyAmount: 5,
  showAbsorbFee: true,
  paymentMethods: [PaymentMethod.StripeCard],
});

const paymentContent = ref<ContentPaymentData>({
  stripePublicKey: '',
  stripeCountry: 'eu',
  taxRate: 0,
  taxRateEnabled: false,
  showOneTimeDonation: false,
  noticeText: '',
});

const oneTimeDonation = reactive({
  amount: 5,
  period: 'one-time' as PaymentPeriod,
  payFee: true,
  prorate: true, // TODO: check if this is correct
  paymentMethod: PaymentMethod.StripeCard,
});

const loading = ref(false);

async function handleSubmitDonation() {
  loading.value = true;

  try {
    // TODO: add correct endpoint as soon as it is done
    // const clientData: CreateOneTimePaymentData = {
    //   amount: oneTimeDonation.amount,
    //   paymentMethod: oneTimeDonation.paymentMethod,
    //   payFee: oneTimeDonation.payFee,
    //   completeUrl: client.signup.completeUrl,
    // };
    // const data = await client.contact.contribution.start(clientData);
    // if (data.redirectUrl) {
    //   window.location.href = data.redirectUrl;
    // } else if (data.clientSecret) {
    //   stripeClientSecret.value = data.clientSecret;
    // }
  } finally {
    loading.value = false;
  }
}

onBeforeMount(async () => {
  profileContent.value = await client.content.get('profile');

  content.value = await client.content.get('join');
  paymentContent.value = await client.content.get('payment');

  callouts.value = (
    await client.callout.list({
      order: 'DESC',
      sort: 'starts',
      limit: 3,
      rules: {
        condition: 'AND',
        rules: [
          {
            field: 'status',
            operator: 'equal',
            value: [ItemStatus.Open],
          },
          {
            field: 'hidden',
            operator: 'equal',
            value: [false],
          },
        ],
      },
    })
  ).items;
});
</script>
