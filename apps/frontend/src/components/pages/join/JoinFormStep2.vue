<template>
  <AuthBox :title="joinContent.title">
    <template #header>
      <div class="content-message" v-html="joinContent.subtitle" />
    </template>

    <AppNotification
      variant="info"
      :title="notificationText"
      :icon="faHandSparkles"
      class="mb-4"
    />
    <p
      v-if="paymentContent.taxRateEnabled"
      class="-mt-2 mb-4 text-right text-xs"
    >
      {{ t('join.tax.included', { taxRate: paymentContent.taxRate }) }}
    </p>

    <p class="mb-3 text-xs font-semibold text-body-80">
      {{ t('joinPayment.note') }}
    </p>
    <p class="mb-6 text-xs font-semibold text-body-80">
      <i18n-t keypath="joinPayment.goBack">
        <template #back>
          <a class="cursor-pointer text-link underline" @click="$emit('back')">
            {{ t('joinPayment.goBackButton') }}
          </a>
        </template>
      </i18n-t>
    </p>

    <StripePayment
      :client-secret="stripeClientSecret"
      :public-key="paymentContent.stripePublicKey"
      :payment-data="data"
      :return-url="client.signup.completeUrl"
      show-name-fields
    />
    <div
      v-if="paymentContent.noticeText"
      class="content-message mt-3 text-center text-xs"
      v-html="paymentContent.noticeText"
    />
  </AuthBox>
</template>
<script lang="ts" setup>
import {
  type ContentJoinData,
  type ContentPaymentData,
  ContributionPeriod,
} from '@beabee/beabee-common';
import { AppNotification } from '@beabee/vue';

import AuthBox from '@components/AuthBox.vue';
import StripePayment from '@components/StripePayment.vue';
import { faHandSparkles } from '@fortawesome/free-solid-svg-icons';
import type { JoinFormData } from '@type/join-form-data';
import { client } from '@utils/api';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { n, t } = useI18n();

defineEmits<{ (e: 'back'): void }>();
defineProps<{
  joinContent: ContentJoinData;
  paymentContent: ContentPaymentData;
  stripeClientSecret: string;
}>();

const data = defineModel<JoinFormData>({ required: true });

const notificationText = computed(() => {
  return t('joinPayment.willBeContributing', {
    contribution: t('join.contribution.' + data.value.period, {
      amount: n(data.value.amount, 'currency'),
    }),
  });
});
</script>
