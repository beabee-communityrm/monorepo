<!-- eslint-disable vue/no-mutating-props -->
<template>
  <AppForm :button-text="t('join.step2Next')" full-button @submit="onSubmit">
    <div class="mb-4">
      <AppInput
        v-model="email"
        :label="t('form.email')"
        type="email"
        name="email"
        required
      />
    </div>
    <ContributionMethod
      v-model:payment-method="paymentMethod"
      v-model:pay-fee="payFee"
      :content="joinContent"
      :data="data"
      :methods="joinContent.paymentMethods"
      show-payment-method
      class="mb-6"
    />
  </AppForm>
</template>
<script lang="ts" setup>
import {
  ContributionPeriod,
  PaymentMethod,
  type ContentJoinData,
} from '@beabee/beabee-common';
import ContributionMethod from '@components/contribution/ContributionMethod.vue';
import { useI18n } from 'vue-i18n';
import AppInput from '@components/forms/AppInput.vue';
import AppForm from '@components/forms/AppForm.vue';

defineProps<{
  data: { period: ContributionPeriod; amount: number };
  fee: number;
  joinContent: ContentJoinData;
  onSubmit?: () => Promise<void>;
}>();

const email = defineModel<string>('email', { required: true });
const paymentMethod = defineModel<PaymentMethod>('paymentMethod', {
  required: true,
});
const payFee = defineModel<boolean>('payFee', { required: true });

const { t } = useI18n();
</script>
