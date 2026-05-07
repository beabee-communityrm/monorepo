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
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import NewCalloutPage from '../new.vue';

const route = useRoute();
const id = computed(() => route.params.id as string);
</script>
