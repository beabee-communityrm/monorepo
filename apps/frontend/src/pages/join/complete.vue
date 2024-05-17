<route lang="yaml">
name: joinComplete
meta:
  layout: Loading
  pageTitle: pageTitle.join
  noAuth: true
</route>

<template><div /></template>

<script lang="ts" setup>
import { onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { completeSignUp } from '../../utils/api/signup';

const route = useRoute();
const router = useRouter();

onBeforeMount(async () => {
  const paymentFlowId = (
    route.query.redirect_flow_id || route.query.setup_intent
  )?.toString();

  if (paymentFlowId) {
    try {
      await completeSignUp({
        paymentFlowId,
        firstname: route.query.firstName?.toString(),
        lastname: route.query.lastName?.toString(),
        vatNumber: route.query.vatNumber?.toString(),
      });
      router.replace('/join/confirm-email');
      return;
      // eslint-disable-next-line no-empty
    } catch (err) {}
  }

  router.replace('/join/failed');
});
</script>
