<route lang="yaml">
name: joinComplete
meta:
  layout: Loading
  pageTitle: pageTitle.join
  noAuth: true
</route>

<template><div /></template>

<script lang="ts" setup>
import { isApiError } from '@beabee/client';

import { client } from '@utils/api';
import { notifyRateLimited } from '@utils/api-error';
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
      await client.signup.complete({
        paymentFlowId,
        firstname: route.query.firstName?.toString(),
        lastname: route.query.lastName?.toString(),
        vatNumber: route.query.vatNumber?.toString(),
      });
      router.replace('/join/confirm-email');
      return;
    } catch (err) {
      if (isApiError(err, undefined, [429])) {
        notifyRateLimited(err);
        return;
      }
    }
  }

  router.replace('/join/failed');
});
</script>
