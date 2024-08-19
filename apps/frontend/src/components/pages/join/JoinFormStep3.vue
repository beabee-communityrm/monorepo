<template>
  <StripePayment
    :client-secret="stripeClientSecret"
    :public-key="stripePublicKey"
    :email="email"
    :return-url="completeUrl"
    show-name-fields
  />
</template>

<script lang="ts" setup>
import StripePayment from '@components/StripePayment.vue';
import { completeUrl } from '@utils/api/signup';

defineProps<{
  email: string;
  stripePublicKey: string;
  stripeClientSecret: string;
}>();
</script>
