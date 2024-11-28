<route lang="yaml">
meta:
  pageTitle: menu.home
</route>
<template><div /></template>
<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { canAdmin, currentUser } from '../store';
import env from '@env';
useRouter().replace(
  canAdmin.value
    ? '/admin'
    : env.cnrMode && currentUser.value?.isReviewer
      ? '/admin/callouts'
      : '/profile'
);
</script>
