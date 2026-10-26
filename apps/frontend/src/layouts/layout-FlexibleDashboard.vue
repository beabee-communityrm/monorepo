<template>
  <div v-if="isEmbed" class="w-full">
    <router-view />
  </div>
  <UDashboardGroup v-else unit="rem">
    <TheMenu />
    <main id="top" class="flex w-full flex-1 flex-col bg-background">
      <UDashboardNavbar :ui="{ root: 'sticky top-0 z-20 bg-default' }">
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
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { isEmbed } from '../store';
import { breadcrumbs } from '../store/breadcrumb';
import TheMenu from './menu/TheMenu.vue';

const { t } = useI18n();
const route = useRoute();
</script>
