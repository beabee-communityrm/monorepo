<route lang="yaml">
name: profileContribution
meta:
  pageTitle: menu.contribution
</route>

<template>
  <PageTitle :title="t('menu.contribution')" />

  <App2ColGrid v-if="!isIniting">
    <template #col1>
      <AppNotification
        v-if="updatedPaymentSource"
        class="mb-8"
        variant="success"
        :title="t('contribution.updatedPaymentSource')"
        removeable
        @remove="updatedPaymentSource = false"
      />
      <AppNotification
        v-if="startedContribution"
        class="mb-8"
        variant="success"
        :title="t('contribution.startedContribution')"
        removeable
        @remove="startedContribution = false"
      />
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
        class="mb-7 md:mb-9"
        :payment-data="paymentSourceData"
        :payment-source="contribution.paymentSource"
        :stripe-public-key="paymentContent.stripePublicKey"
      />
      <ContactCancelContribution
        id="me"
        :contribution="contribution"
        @cancel="router.push('/profile/contribution/cancel')"
      />
    </template>
    <template #col2>
      <ContactPaymentsHistory id="me" />
    </template>
  </App2ColGrid>
</template>

<script lang="ts" setup>
import {
  ContributionPeriod,
  ContributionType,
  MembershipStatus,
  PaymentMethod,
  type ContentPaymentData,
  type ContributionInfo,
} from '@beabee/beabee-common';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ContributionBox from '@components/pages/profile/contribution/ContributionBox.vue';
import ContactCancelContribution from '@components/contact/ContactCancelContribution.vue';
import PaymentSource from '@components/pages/profile/contribution/PaymentSource.vue';
import PageTitle from '@components/PageTitle.vue';
import ContactPaymentsHistory from '@components/contact/ContactPaymentsHistory.vue';
import UpdateContribution from '@components/pages/profile/contribution/UpdateContribution.vue';
import type { ContributionContent } from '@components/contribution/contribution.interface';

import { client } from '@utils/api';

import App2ColGrid from '@components/App2ColGrid.vue';
import { AppNotification } from '@beabee/vue/components';

import { currentUser } from '@store';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const updatedPaymentSource = ref(
  route.query.updatedPaymentSource !== undefined
);
const startedContribution = ref(route.query.startedContribution !== undefined);
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
  taxRate: 0,
  taxRateEnabled: false,
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

onBeforeMount(async () => {
  isIniting.value = true;

  content.value = await client.content.get('join');
  paymentContent.value = await client.content.get('payment');

  contribution.value = await client.contact.contribution.get();
  isIniting.value = false;
});
</script>
