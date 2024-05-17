<route lang="yaml">
name: adminCalloutEdit
meta:
  pageTitle: menu.callouts
  role: admin
</route>

<template>
  <NewCalloutPage :id="id" />
</template>

<script lang="ts" setup>
import NewCalloutPage from '../new.vue';

defineProps<{ id: string }>();
</script>
