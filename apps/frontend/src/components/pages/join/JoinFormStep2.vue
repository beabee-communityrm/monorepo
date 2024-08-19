<!-- eslint-disable vue/no-mutating-props -->
<template>
  <AppForm :button-text="'Finish payment'" full-button @submit="onSubmit">
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
      v-model="paymentMethod"
      :methods="joinContent.paymentMethods"
    />
    <ContributionFee
      v-if="
        data.period === ContributionPeriod.Monthly && joinContent.showAbsorbFee
      "
      v-model="payFee"
      :amount="data.amount"
      :fee="fee"
      :force="false"
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
import ContributionFee from '@components/contribution/ContributionFee.vue';
import { useI18n } from 'vue-i18n';
import type { SignupData } from '@type/signup-data';
import AppInput from '@components/forms/AppInput.vue';
import AppForm from '@components/forms/AppForm.vue';

defineProps<{
  data: SignupData;
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
