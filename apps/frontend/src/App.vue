<template>
  <UApp>
    <RouteProgress />

    <LayoutApp />

    <AppNotificationContainer
      :class="!isEmbed && 'fixed bottom-16 left-16 z-50 w-96'"
    />

    <DevRequestBar v-if="DevRequestBar" />
  </UApp>
</template>

<script lang="ts" setup>
import { AppNotificationContainer } from '@beabee/vue';

import { defineAsyncComponent } from 'vue';

import RouteProgress from './components/RouteProgress.vue';
import LayoutApp from './layouts/layout-App.vue';
import { isEmbed } from './store';

const DevRequestBar = import.meta.env.DEV
  ? defineAsyncComponent(() => import('./components/dev/DevRequestBar.vue'))
  : undefined;
</script>
