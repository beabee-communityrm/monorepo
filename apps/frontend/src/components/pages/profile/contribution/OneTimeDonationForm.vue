<template>
  <PaymentFlowForm
    id="profile-one-time-contribution"
    :button-text="t('homePage.makeOneTimeDonationButton')"
    :title="t(`paymentMethods.${formData.paymentMethod}.setLabel`)"
    :stripe-public-key="paymentContent.stripePublicKey"
    :flow-data="paymentFlowData"
    :start-flow="startDonationFlow"
    :complete-flow="completeDonationFlow"
  >
    <SectionTitle>{{ t('homePage.makeOneTimeDonationTitle') }}</SectionTitle>

    <AppContribution
      v-model:amount="formData.amount"
      v-model:pay-fee="formData.payFee"
      v-model:payment-method="formData.paymentMethod"
      :content="content"
      :payment-content="paymentContent"
      :show-period="false"
      period="one-time"
      mode="one-time"
    />
  </PaymentFlowForm>
</template>
<script lang="ts" setup>
import { type ContentPaymentData, PaymentMethod } from '@beabee/beabee-common';
import { addNotification } from '@beabee/vue';

import AppContribution from '@components/contribution/AppContribution.vue';
import PaymentFlowForm from '@components/forms/PaymentFlowForm.vue';
import { currentUser } from '@store/currentUser';
import type { ContributionContent } from '@type/contribution';
import { client } from '@utils/api';
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import SectionTitle from '../SectionTitle.vue';

const props = defineProps<{
  content: ContributionContent;
  paymentContent: ContentPaymentData;
}>();

const { t } = useI18n();

const formData = reactive({
  amount: 5,
  payFee: true,
  paymentMethod: PaymentMethod.StripeCard,
});

const paymentFlowData = computed(() => ({
  email: currentUser.value?.email || '',
  amount: formData.amount,
  period: 'one-time' as const,
}));

async function startDonationFlow(completeUrl: string) {
  return await client.contact.payment.create({
    amount: formData.amount,
    payFee: formData.payFee,
    paymentMethod: formData.paymentMethod,
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

watch(props, (newProps) => {
  formData.paymentMethod = newProps.content.paymentMethods[0];
});
</script>
