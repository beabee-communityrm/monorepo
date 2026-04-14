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

import { client } from '#utils/api';
import { handleJoinError } from '#utils/api-error';

const route = useRoute();
const router = useRouter();

onBeforeMount(async () => {
  const paymentFlowId = route.query.paymentFlowId?.toString();
  if (paymentFlowId) {
    try {
      await client.signup.advance(paymentFlowId);
      router.replace('/join/confirm-email');
    } catch (err) {
      handleJoinError(err, router);
    }
  } else {
    router.replace('/join/failed');
  }
});
</script>
