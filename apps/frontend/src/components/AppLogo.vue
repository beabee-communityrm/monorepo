<template>
  <img :src="url" :alt="generalContent.organisationName" />
</template>
<script lang="ts" setup>
import env from '@env';
import { generalContent } from '../store';
import defaultLogo from '../assets/images/logo.png';
import { computed } from 'vue';

const url = computed(() =>
  generalContent.value.logoUrl
    ? `${env.apiUrl}/${generalContent.value.logoUrl}`
    : defaultLogo
);
</script>
