<route lang="yaml">
name: set_password
meta:
  pageTitle: pageTitle.setPassword
  layout: Auth
  noAuth: true
</route>

<template>
  <ResetPasswordPage :id="id" mode="set" />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import ResetPasswordPage from '../reset-password/[id].vue';

const route = useRoute('set_password');
// Extract id from route params
const id = computed(() => route.params.id);
</script>
