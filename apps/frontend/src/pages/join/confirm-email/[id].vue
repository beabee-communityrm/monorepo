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
import { onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';

import { updateCurrentUser } from '../../../store';

const props = defineProps<{ id: string }>();

const router = useRouter();

onBeforeMount(() => {
  client.signup
    .confirmEmail(props.id)
    .then(() => updateCurrentUser())
    .then(() => router.replace('/join/setup'))
    .catch(() => {
      router.replace('/join/failed');
    });
});
</script>
