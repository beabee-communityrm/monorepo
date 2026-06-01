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
      :start-flow="startUpdateFlow"
      :complete-flow="completeUpdateFlow"
      @completed="handleCompletedFlow"
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

async function startUpdateFlow(
  params: PaymentFlowSetupParams
): Promise<PaymentFlowSetupResult> {
  return await client.contact.paymentMethod.update(params);
}

async function completeUpdateFlow(
  paymentFlowId: string,
  params?: PaymentFlowAdvanceParams
) {
  await client.contact.paymentMethod.completeUpdate(paymentFlowId, params);
}

async function handleCompletedFlow() {
  contribution.value = await client.contact.contribution.get();

  addNotification({
    title: t('contribution.updatedPaymentSource'),
    variant: 'success',
  });
}
</script>
