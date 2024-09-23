<route lang="yaml">
name: calloutThanks
meta:
  pageTitle: menu.callouts
  noAuth: true
  embeddable: true
</route>
<template>
  <CalloutPage :callout="callout" thanks />
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import CalloutPage from './index.vue';
defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
}>();
</script>
