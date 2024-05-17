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
import ResetPasswordPage from '../reset-password/[id].vue';
defineProps<{ id: string }>();
</script>
