<route lang="yaml">
meta:
  pageTitle: menu.home
</route>
<template><div /></template>
<script lang="ts" setup>
import env from '@env';
import { useRouter } from 'vue-router';

import { canAdmin, currentUser } from '../store';

useRouter().replace(
  canAdmin.value
    ? '/admin'
    : env.cnrMode && currentUser.value?.isReviewer
      ? '/admin/crowdnewsroom'
      : '/profile'
);
</script>
