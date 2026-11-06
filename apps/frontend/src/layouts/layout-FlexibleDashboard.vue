<template>
  <div v-if="isEmbed" class="w-full">
    <router-view />
  </div>
  <UDashboardGroup v-else unit="rem">
    <TheSidebar v-if="currentUser" />
    <main id="top" class="flex w-full flex-1 flex-col bg-background">
      <TheNavbar class="sticky top-0 z-20" />
      <div class="flex min-h-0 flex-1 flex-col p-4 pb-0 md:p-5 md:pb-0">
        <router-view />
      </div>
    </main>
  </UDashboardGroup>
</template>

<script lang="ts" setup>
/**
 * FlexibleDashboard Layout
 *
 * This layout is used for dashboard pages that have self-contained scrollable content.
 *
 * @component
 */
import { currentUser, isEmbed } from '../store';
import TheSidebar from './menu/TheSidebar.vue';
import TheNavbar from './menu/TheNavbar.vue';
</script>
