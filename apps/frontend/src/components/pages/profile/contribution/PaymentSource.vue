<template>
  <div>
    <AppHeading>{{ t('contribution.paymentMethod') }}</AppHeading>

    <PaymentMethod class="mb-4" :source="paymentSource" />

    <PaymentFlowForm
      id="profile-update-payment-source"
      :title="changeLabel"
      :button-text="changeLabel"
      :stripe-public-key="stripePublicKey"
      :flow-data="{ ...paymentData, paymentMethod: paymentSource.method }"
      :start-flow="handleStartPaymentUpdate"
      :complete-flow="handleCompletePaymentUpdate"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  type ContributionInfo,
  type PaymentFlowAdvanceParams,
  type PaymentFlowSetupParams,
  type PaymentFlowSetupResult,
  type PaymentSource,
  type PaymentSourceManual,
} from '@beabee/beabee-common';
import { AppHeading, addNotification } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import PaymentFlowForm from '#components/forms/PaymentFlowForm.vue';
import { PaymentMethod } from '#components/payment';
import type { PaymentFlowFormData } from '#type/payment-flow-form-data';
import { client } from '#utils/api';

const { t } = useI18n();

const props = defineProps<{
  stripePublicKey: string;
  paymentSource: Exclude<PaymentSource, PaymentSourceManual>;
  paymentData: Omit<PaymentFlowFormData, 'paymentMethod'>;
}>();

const contribution = defineModel<ContributionInfo>({ required: true });

const changeLabel = computed(() =>
  t(`paymentMethods.${props.paymentSource.method}.changeLabel`)
);

async function handleStartPaymentUpdate(
  params: PaymentFlowSetupParams
): Promise<PaymentFlowSetupResult> {
  return await client.contact.paymentMethod.update(params);
}

async function handleCompletePaymentUpdate(
  paymentFlowId: string,
  params?: PaymentFlowAdvanceParams
) {
  contribution.value = await client.contact.paymentMethod.completeUpdate(
    paymentFlowId,
    params
  );

  addNotification({
    title: t('contribution.updatedPaymentSource'),
    variant: 'success',
  });
}
</script>
