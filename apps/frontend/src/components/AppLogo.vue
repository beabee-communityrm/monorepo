<template>
  <img
    :src="generalContent.logoUrl || defaultLogo"
    :alt="generalContent.organisationName"
  />
</template>
<script lang="ts" setup>
import { generalContent } from '../store';
import defaultLogo from '../assets/images/logo.png';
</script>
