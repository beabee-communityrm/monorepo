<template>
  <StripePayment
    :client-secret="stripeClientSecret"
    :public-key="stripePublicKey"
    :email="email"
    :return-url="completeUrl"
    :button-text="t('join.step3Next')"
    show-name-fields
  />
</template>

<script lang="ts" setup>
import StripePayment from '@components/StripePayment.vue';
import { completeUrl } from '@utils/api/signup';
import { useI18n } from 'vue-i18n';

defineProps<{
  email: string;
  stripePublicKey: string;
  stripeClientSecret: string;
}>();

const { t } = useI18n();
</script>
