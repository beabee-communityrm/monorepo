<route lang="yaml">
name: adminCalloutEdit
meta:
  pageTitle: menu.callouts
  layout: FlexibleDashboard
</route>

<template>
  <NewCalloutPage :id="id" />
</template>

<script lang="ts" setup>
import NewCalloutPage from '../new.vue';

defineProps<{ id: string }>();
</script>
