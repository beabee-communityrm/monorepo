<route lang="yaml">
name: confirmEmailLoading
meta:
  layout: Loading
  noAuth: true
  pageTitle: pageTitle.confirmEmail
</route>
<template><div /></template>

<script lang="ts" setup>
import { client } from '@utils/api';
import { computed, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { updateCurrentUser } from '../../../store';

const route = useRoute('confirmEmailLoading');
const router = useRouter();

// Extract id from route params
const id = computed(() => route.params.id);

onBeforeMount(() => {
  client.signup
    .confirmEmail(id.value)
    .then(() => updateCurrentUser())
    .then(() => router.replace('/join/setup'))
    .catch(() => {
      router.replace('/join/failed');
    });
});
</script>
