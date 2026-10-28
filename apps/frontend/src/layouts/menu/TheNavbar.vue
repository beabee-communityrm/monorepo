<template>
  <UDashboardNavbar v-if="currentUser" :ui="{ root: 'bg-default' }">
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
  <UDashboardNavbar v-else :toggle="false" :ui="{ root: 'bg-default' }">
    <template #left>
      <a :href="generalContent.siteUrl">
        <AppLogo class="h-10 w-auto object-contain" />
      </a>
      <h1 v-if="breadcrumbs.length === 1" class="sr-only">
        {{ t(route.meta.pageTitle) }}
      </h1>
    </template>
    <template v-if="!env.cnrMode" #right>
      <UButton
        :label="t('menu.login')"
        icon="i-lucide-log-in"
        :to="{ path: '/auth/login', query: { next: route.fullPath } }"
      />
    </template>
  </UDashboardNavbar>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import env from '#env';

import AppLogo from '../../components/AppLogo.vue';
import { currentUser, generalContent } from '../../store';
import { breadcrumbs } from '../../store/breadcrumb';

const { t } = useI18n();
const route = useRoute();
</script>
