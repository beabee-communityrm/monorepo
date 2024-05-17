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
import CalloutPage from './index.vue';
import type { GetCalloutDataWith } from '@type';
defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>;
}>();
</script>
