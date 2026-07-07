<template>
  <UDashboardSidebar
    collapsible
    resizable
    :ui="{
      header: 'border-b border-default',
      footer: 'border-t border-default',
    }"
  >
    <template #header="{ collapsed }">
      <router-link to="/" :class="!collapsed && 'pl-2.5'">
        <AppLogo class="h-10 w-auto max-w-full object-contain" />
      </router-link>
    </template>

    <template #default="{ collapsed }">
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        :collapsed="collapsed"
        :ui="{
          link: 'py-2.5',
          linkLeadingIcon: 'size-4.5',
          label: '[font-variant:small-caps] text-sm text-muted',
        }"
        tooltip
      />
    </template>

    <template #footer="{ collapsed }">
      <UNavigationMenu
        :items="[[logoutItem]]"
        orientation="vertical"
        :collapsed="collapsed"
        :ui="{ link: 'py-2.5', linkLeadingIcon: 'size-4.5' }"
        class="w-full"
        tooltip
        @select="doLogout"
      />
    </template>
  </UDashboardSidebar>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { client } from '#utils/api';

import AppLogo from '../../components/AppLogo.vue';
import { useMenu } from './menu-list';

const router = useRouter();
const { t } = useI18n();

const { items } = useMenu();

const logoutItem: NavigationMenuItem = {
  label: t('menu.logout'),
  icon: 'i-lucide-log-out',
};

function doLogout() {
  client.auth.logout();
  router.push('/auth/login');
}
</script>
