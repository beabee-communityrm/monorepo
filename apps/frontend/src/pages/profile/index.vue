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
    v-if="paymentContent && profileContent.showOneTimeDonation"
    class="mb-6 lg:mr-6 lg:w-1/4"
  >
    <PaymentFlowForm
      id="profile-one-time-contribution"
      :button-text="t('homePage.makeOneTimeDonationButton')"
      :title="t(`paymentMethods.${oneTimeDonation.paymentMethod}.setLabel`)"
      :stripe-public-key="paymentContent.stripePublicKey"
      :flow-data="paymentFlowData"
      :start-flow="startDonationFlow"
      :complete-flow="completeDonationFlow"
    >
      <SectionTitle>{{ t('homePage.makeOneTimeDonationTitle') }}</SectionTitle>

      <AppContribution
        v-model:amount="oneTimeDonation.amount"
        v-model:pay-fee="oneTimeDonation.payFee"
        v-model:payment-method="oneTimeDonation.paymentMethod"
        :content="content"
        :payment-content="paymentContent"
        :show-period="false"
        period="one-time"
        mode="one-time"
      />
    </PaymentFlowForm>
  </section>
</template>

<script lang="ts" setup>
import {
  type ContentPaymentData,
  type ContentProfileData,
  ContributionPeriod,
  type GetCalloutData,
  type GetContactData,
  ItemStatus,
  PaymentMethod,
} from '@beabee/beabee-common';
import {
  AppButton,
  PageTitle,
  WelcomeMessage,
  addNotification,
} from '@beabee/vue';

import CalloutCard from '@components/callout/CalloutCard.vue';
import AppContribution from '@components/contribution/AppContribution.vue';
import PaymentFlowForm from '@components/forms/PaymentFlowForm.vue';
import ContributionInfo from '@components/pages/profile/ContributionInfo.vue';
import NoticeContainer from '@components/pages/profile/NoticeContainer.vue';
import QuickActions from '@components/pages/profile/QuickActions.vue';
import SectionTitle from '@components/pages/profile/SectionTitle.vue';
import { currentUser, generalContent } from '@store';
import type { ContributionContent } from '@type/contribution';
import { client } from '@utils/api';
import { type Ref, computed, onBeforeMount, reactive, ref } from 'vue';
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
  showOneTimeDonation: false,
});

const callouts = ref<GetCalloutData[]>([]);

// This page is behind auth so currentUser can't be null
// TODO: is there a nicer way to handle this?
const user = currentUser as Ref<GetContactData>;

const content = ref<ContributionContent>({
  initialAmount: 5,
  initialPeriod: ContributionPeriod.Monthly,
  minMonthlyAmount: 5,
  periods: [],
  showAbsorbFee: true,
  paymentMethods: [PaymentMethod.StripeCard],
});

const paymentContent = ref<ContentPaymentData>();

const oneTimeDonation = reactive({
  amount: 5,
  payFee: true,
  paymentMethod: PaymentMethod.StripeCard,
});
const paymentFlowData = computed(() => ({
  email: user.value.email,
  amount: oneTimeDonation.amount,
  period: 'one-time' as const,
}));

async function startDonationFlow(completeUrl: string) {
  return await client.contact.payment.create({
    amount: oneTimeDonation.amount,
    payFee: oneTimeDonation.payFee,
    paymentMethod: oneTimeDonation.paymentMethod,
    completeUrl,
  });
}

async function completeDonationFlow(paymentFlowId: string) {
  await client.contact.payment.complete(paymentFlowId);

  addNotification({
    variant: 'success',
    title: t('homePage.oneTimeContributionSuccessMessage'),
  });
}

onBeforeMount(async () => {
  profileContent.value = await client.content.get('profile');

  if (profileContent.value.showOneTimeDonation) {
    content.value = await client.content.get('join');
    if (content.value.periods.some((p) => p.name === 'one-time')) {
      paymentContent.value = await client.content.get('payment');
    }
  }

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
