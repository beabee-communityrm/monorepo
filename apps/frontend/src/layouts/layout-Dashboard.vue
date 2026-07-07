<template>
  <div v-if="isEmbed" class="w-full">
    <router-view />
  </div>
  <UDashboardGroup v-else unit="rem">
    <TheMenu />
    <main
      id="top"
      class="flex h-screen w-full flex-col overflow-y-auto bg-neutral-40"
    >
      <UDashboardNavbar :ui="{ root: 'sticky top-0 z-10 bg-white' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #title>
          <UBreadcrumb
            :items="breadcrumbs"
            class="p-1.5"
            :ui="{ link: breadcrumbs.length > 1 ? 'text-base' : 'text-xl' }"
          />
        </template>
      </UDashboardNavbar>
      <div class="flex flex-col p-4 md:p-5">
        <router-view />
      </div>
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
import { isEmbed } from '../store';
import { useBreadcrumbs } from '../store/breadcrumb';
import TheMenu from './menu/TheMenu.vue';

const breadcrumbs = useBreadcrumbs();
</script>
