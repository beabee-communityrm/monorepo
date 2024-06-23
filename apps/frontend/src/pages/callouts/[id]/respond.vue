<route lang="yaml">
name: calloutRespond
meta:
  pageTitle: menu.callouts
  noAuth: true
</route>
<template>
  <CalloutPage :callout="callout" respond />
</template>
<script lang="ts" setup>
import CalloutPage from './index.vue';
import type { GetCalloutDataWith } from '@beabee/beabee-common';
defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
}>();
</script>
