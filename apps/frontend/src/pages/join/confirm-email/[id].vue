<route lang="yaml">
name: confirmEmailLoading
meta:
  layout: Loading
  noAuth: true
  pageTitle: pageTitle.confirmEmail
</route>
<template><div /></template>

<script lang="ts" setup>
import { isApiError } from '@beabee/client';

import { client } from '@utils/api';
import { notifyRateLimited } from '@utils/api-error';
import { onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { updateCurrentUser } from '../../../store';

const route = useRoute('confirmEmailLoading');
const router = useRouter();

onBeforeMount(() => {
  client.signup
    .confirmEmail(route.params.id)
    .then(() => updateCurrentUser())
    .then(() => router.replace('/join/setup'))
    .catch((err) => {
      if (isApiError(err, undefined, [429])) {
        notifyRateLimited(err);
        return;
      }
      router.replace('/join/failed');
    });
});
</script>
