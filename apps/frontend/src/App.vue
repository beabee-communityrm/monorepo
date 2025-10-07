<template>
  <LayoutApp />

  <AppNotificationContainer
    :class="!isEmbed && 'fixed bottom-16 left-16 z-50 w-96'"
  />
</template>

<script lang="ts" setup>
import { AppNotificationContainer } from '@beabee/vue';

import LayoutApp from './layouts/layout-App.vue';
import { isEmbed } from './store';
</script>
