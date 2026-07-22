<route lang="yaml">
name: adminSettings
meta:
  role: admin
</route>

<template>
  <PageTitle :title="t('menu.adminSettings')" />
  <AppTabs :items="tabs" :selected="selectedTab?.id || ''" />
  <router-view />
</template>

<script lang="ts" setup>
import { AppTabs, PageTitle } from '@beabee/vue';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { resolveTabNavigation } from '#utils/navigation';
import { routeIcons, routeLabels } from '#utils/route-nav';

import { addBreadcrumb } from '../../store/breadcrumb';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const tabs = computed(() =>
  resolveTabNavigation(router, [
    {
      id: 'adminSettingsGeneral',
      label: t('adminSettings.general.label'),
    },
    {
      id: 'adminSettingsEmail',
      label: t('adminSettings.email.label'),
    },
    {
      id: 'adminSettingsTheme',
      label: t('adminSettings.theme.label'),
    },
    {
      id: 'adminSettingsApikeys',
      label: t('adminSettings.apikey.label'),
    },
    {
      id: 'adminSettingsIntegrations',
      label: t('adminSettings.integrations.label'),
    },
  ])
);

const selectedTab = computed(() =>
  tabs.value.find((tab) => route.name.startsWith(tab.id))
);

addBreadcrumb(
  computed(() => [
    {
      label: t(routeLabels.adminSettings),
      to: '/admin/settings',
      icon: routeIcons.adminSettings,
    },
  ])
);
</script>
