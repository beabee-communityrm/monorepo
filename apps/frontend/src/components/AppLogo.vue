<template>
  <img :src="url" :alt="generalContent.organisationName" />
</template>
<script lang="ts" setup>
import { computed } from 'vue';

import env from '#env';

import defaultLogo from '../assets/images/logo.png';
import { generalContent } from '../store';

const url = computed(() =>
  generalContent.value.logoUrl
    ? `${env.apiUrl}/${generalContent.value.logoUrl}`
    : defaultLogo
);
</script>
