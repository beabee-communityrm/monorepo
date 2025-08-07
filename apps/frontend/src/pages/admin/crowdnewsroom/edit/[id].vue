<route lang="yaml">
name: adminCalloutEdit
meta:
  pageTitle: menu.callouts
  layout: FlexibleDashboard
</route>

<template>
  <NewCalloutPage :id="route.params.id" />
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';

import NewCalloutPage from '../new.vue';

const route = useRoute('adminCalloutEdit');
</script>
