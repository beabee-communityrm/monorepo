<template>
  <div v-if="isEmbed" class="w-full">
    <router-view />
  </div>
  <UDashboardGroup v-else unit="rem">
    <TheMenu />
    <main
      id="top"
      class="flex h-screen w-full flex-col overflow-y-auto bg-background"
    >
      <div class="sticky top-0 z-20">
        <UDashboardNavbar :ui="{ root: 'bg-default' }">
          <template #left>
            <UDashboardSidebarCollapse />
            <UBreadcrumb
              :items="breadcrumbs"
              class="truncate p-1.5"
              :ui="{ link: breadcrumbs.length > 1 ? 'text-base' : 'text-xl' }"
            />
            <!-- A lone breadcrumb stands in as the page title. A longer trail does
                 not, so those pages render their own heading. -->
            <h1 v-if="breadcrumbs.length === 1" class="sr-only">
              {{ t(route.meta.pageTitle) }}
            </h1>
          </template>
        </UDashboardNavbar>
        <div id="sticky-top-banner" class="bg-default"></div>
      </div>
      <div class="flex flex-col p-4 md:p-5">
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
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import TheFooter from '../components/TheFooter.vue';
import { isEmbed } from '../store';
import { breadcrumbs } from '../store/breadcrumb';
import TheMenu from './menu/TheMenu.vue';

const { t } = useI18n();
const route = useRoute();
</script>
