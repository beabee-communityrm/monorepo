<route lang="yaml">
name: confirmEmailLoading
meta:
  layout: Loading
  noAuth: true
  pageTitle: pageTitle.confirmEmail
</route>
<template><div /></template>

<script lang="ts" setup>
import { onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { client } from '#utils/api';
import { handleJoinError } from '#utils/api-error';

import { updateCurrentUser } from '../../../store';

const route = useRoute('confirmEmailLoading');
const router = useRouter();

onBeforeMount(async () => {
  try {
    await client.signup.confirmEmail(route.params.id);
    // User has been logged in, update our current user to reflect this
    await updateCurrentUser();
    router.replace('/join/setup');
  } catch (err) {
    handleJoinError(err, router);
  }
});
</script>
