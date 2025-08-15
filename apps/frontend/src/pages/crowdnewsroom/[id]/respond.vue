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
import type { GetCalloutDataWith } from '@beabee/beabee-common';

import CalloutPage from './index.vue';

defineProps<{
  callout: GetCalloutDataWith<
    'form' | 'responseViewSchema' | 'variantNames' | 'variants'
  >;
}>();
</script>
