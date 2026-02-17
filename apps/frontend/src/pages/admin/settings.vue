<route lang="yaml">
name: adminSettings
meta:
  role: admin
</route>

<template>
  <PageTitle :title="t('menu.adminSettings')" />
  <AppTabs :items="tabs" :selected="(route.name as string) || ''" />
  <router-view />
</template>

<script lang="ts" setup>
import { AppTabs, PageTitle } from '@beabee/vue';

import { faCog } from '@fortawesome/free-solid-svg-icons';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { resolveTabNavigation } from '#utils/navigation';

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
  ])
);

const selectedTab = computed(() =>
  tabs.value.find((tab) => tab.id === route.name)
);

addBreadcrumb(
  computed(() => [
    {
      title: t('menu.adminSettings'),
      to: '/admin/settings',
      icon: faCog,
    },
    ...(selectedTab.value
      ? [
          {
            title: selectedTab.value.label,
            to: selectedTab.value.to,
          },
        ]
      : []),
  ])
);
</script>
