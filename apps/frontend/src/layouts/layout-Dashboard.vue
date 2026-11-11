<template>
  <div v-if="isEmbed" class="w-full">
    <router-view />
  </div>
  <UDashboardGroup v-else unit="rem">
    <TheSidebar v-if="currentUser" />
    <main
      id="top"
      class="flex h-screen w-full flex-col overflow-y-auto bg-background"
    >
      <div class="sticky top-0 z-20">
        <TheNavbar />
        <div id="sticky-top-banner" class="bg-default"></div>
      </div>
      <div
        class="flex flex-col p-4 md:p-5"
        :class="!currentUser && 'mx-auto w-full max-w-3xl'"
      >
        <router-view />
      </div>

      <div id="sticky-bottom-banner" class="sticky bottom-0 z-20"></div>
      <TheFooter class="mt-auto flex-none" />
    </main>
  </UDashboardGroup>
</template>

<script lang="ts" setup>
/**
 * Dashboard Layout
 *
 * This layout is used for dashboard pages and makes the full content scrollable
 *
 * @component
 */
import TheFooter from '../components/TheFooter.vue';
import { currentUser, isEmbed } from '../store';
import TheSidebar from './menu/TheSidebar.vue';
import TheNavbar from './menu/TheNavbar.vue';
</script>
