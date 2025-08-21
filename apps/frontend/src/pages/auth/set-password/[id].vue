<route lang="yaml">
name: set_password
meta:
  pageTitle: pageTitle.setPassword
  layout: Auth
  noAuth: true
</route>

<template>
  <ResetPasswordPage :id="route.params.id" mode="set" />
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';

import ResetPasswordPage from '../reset-password/[id].vue';

const route = useRoute('set_password');
</script>
