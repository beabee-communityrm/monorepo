<route lang="yaml">
name: joinComplete
meta:
  layout: Loading
  pageTitle: pageTitle.join
  noAuth: true
</route>

<template><div /></template>

<script lang="ts" setup>
import { PaymentFlowStatus } from '@beabee/beabee-common';
import { onBeforeMount, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { client } from '#utils/api';
import { handleJoinError } from '#utils/api-error';
import { updateCurrentUser } from '#store/currentUser';

const route = useRoute();
const router = useRouter();

const MAX_CHECKS = 15;

let timeoutId: number | undefined;
let checks = 0;

async function checkComplete(paymentFlowId: string) {
  try {
    const { status } = await client.paymentFlow.get(paymentFlowId);
    if (status === PaymentFlowStatus.Completed) {
      await updateCurrentUser();
      router.replace('/join/setup');
    } else if (++checks >= MAX_CHECKS) {
      router.replace('/join/failed');
    } else {
      timeoutId = setTimeout(() => checkComplete(paymentFlowId), 2000);
    }
  } catch (err) {
    handleJoinError(err, router);
  }
}

onBeforeMount(() => {
  const paymentFlowId = route.query.paymentFlowId?.toString();
  if (paymentFlowId) {
    checkComplete(paymentFlowId);
  } else {
    router.replace('/join/failed');
  }
});

onUnmounted(() => timeoutId && clearTimeout(timeoutId));
</script>
