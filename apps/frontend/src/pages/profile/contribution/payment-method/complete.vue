<route lang="yaml">
name: profileContributionPaymentMethodComplete
meta:
  pageTitle: menu.contribution
  layout: Loading
</route>

<template><div /></template>

<script lang="ts" setup>
import { client } from '@utils/api';
import { onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

onBeforeMount(async () => {
  const paymentFlowId = (
    route.query.redirect_flow_id || route.query.setup_intent
  )?.toString();

  if (paymentFlowId) {
    try {
      await client.contact.paymentMethod.completeUpdate(paymentFlowId);
      router.replace({
        path: '/profile/contribution',
        query: { updatedPaymentSource: null },
      });
      return;
      // eslint-disable-next-line no-empty, @typescript-eslint/no-unused-vars
    } catch (_err) {}
  }

  router.replace('/profile/contribution');
});
</script>
