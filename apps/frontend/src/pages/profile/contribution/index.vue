<route lang="yaml">
name: profileContribution
meta:
  pageTitle: menu.contribution
</route>

<template>
  <PageTitle :title="t('menu.contribution')" border />

  <App2ColGrid v-if="!isIniting">
    <template #col1>
      <AppTabs
        v-if="showOneTimeContribution"
        :items="[
          { id: 'recurring', label: t('common.paymentType.recurring') },
          { id: 'one-time', label: t('common.paymentType.oneTime') },
        ]"
        :selected="activeTab"
        @tab-click="activeTab = $event"
      />

      <template v-if="activeTab === 'recurring'">
        <AppNotification
          v-if="cancelledContribution"
          class="mb-8"
          variant="error"
          :title="t('contribution.cancelledContribution')"
          removeable
          @remove="cancelledContribution = false"
        />

        <ContributionBox :contribution="contribution" class="mb-9" />

        <UpdateContribution
          v-model="contribution"
          :content="content"
          :payment-content="paymentContent"
          class="mb-7 md:mb-9"
        />

        <PaymentSource
          v-if="contribution.paymentSource?.method"
          v-model="contribution"
          :payment-data="paymentSourceData"
          :payment-source="contribution.paymentSource"
          :stripe-public-key="paymentContent.stripePublicKey"
          class="mb-7 md:mb-9"
        />

        <ContactCancelContribution
          id="me"
          :contribution="contribution"
          @cancel="router.push('/profile/contribution/cancel')"
        />
      </template>

      <OneTimeDonationForm
        v-else
        :content="content"
        :payment-content="paymentContent"
      />
    </template>
    <template #col2>
      <ContactPaymentsHistory id="me" />
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import {
  type ContentPaymentData,
  type ContributionInfo,
  ContributionPeriod,
  ContributionType,
  MembershipStatus,
  PaymentMethod,
} from '@beabee/beabee-common';
import { App2ColGrid, AppNotification, AppTabs, PageTitle } from '@beabee/vue';

import ContactCancelContribution from '@components/contact/ContactCancelContribution.vue';
import ContactPaymentsHistory from '@components/contact/ContactPaymentsHistory.vue';
import ContributionBox from '@components/pages/profile/contribution/ContributionBox.vue';
import OneTimeDonationForm from '@components/pages/profile/contribution/OneTimeDonationForm.vue';
import PaymentSource from '@components/pages/profile/contribution/PaymentSource.vue';
import UpdateContribution from '@components/pages/profile/contribution/UpdateContribution.vue';
import { currentUser } from '@store';
import { client } from '@utils/api';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import type { ContributionContent } from '../../../type/contribution';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const activeTab = computed({
  get: () => route.query.tab?.toString() || 'recurring',
  set: (value) => {
    router.push({ query: { ...route.query, tab: value } });
  },
});

const cancelledContribution = ref(route.query.cancelled !== undefined);

const content = ref<ContributionContent>({
  initialAmount: 5,
  initialPeriod: ContributionPeriod.Monthly,
  minMonthlyAmount: 5,
  periods: [],
  showAbsorbFee: true,
  paymentMethods: [PaymentMethod.StripeCard],
});

const paymentContent = ref<ContentPaymentData>({
  stripePublicKey: '',
  stripeCountry: 'eu',
  taxRateRecurring: null,
  taxRateOneTime: null,
  noticeText: '',
  showOneTimeDonation: false,
});

const isIniting = ref(true);
const contribution = ref<ContributionInfo>({
  type: ContributionType.None,
  membershipStatus: MembershipStatus.None,
});

const paymentSourceData = computed(() => ({
  email: currentUser.value ? currentUser.value.email : '',
  amount: contribution.value.amount || 0,
  period: contribution.value.period || ContributionPeriod.Monthly,
}));

const showOneTimeContribution = computed(
  () =>
    content.value?.periods.some((p) => p.name === 'one-time') &&
    paymentContent.value.showOneTimeDonation
);

onBeforeMount(async () => {
  isIniting.value = true;

  content.value = await client.content.get('join');
  paymentContent.value = await client.content.get('payment');

  contribution.value = await client.contact.contribution.get();
  isIniting.value = false;
});
</script>
