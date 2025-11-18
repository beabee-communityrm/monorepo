<route lang="yaml">
name: adminEmails
meta:
  role: admin
</route>

<template>
  <PageTitle :title="t('menu.emails')" />
  <AppTabs :items="tabs" :selected="(route.name as string) || ''" />
  <router-view />
</template>

<script lang="ts" setup>
import { AppTabs, PageTitle } from '@beabee/vue';

import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { resolveTabNavigation } from '@utils/navigation';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { addBreadcrumb } from '../../store/breadcrumb';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const tabs = computed(() =>
  resolveTabNavigation(router, [
    {
      id: 'adminEmailsCustom',
      label: t('emails.tabs.custom'),
    },
    {
      id: 'adminEmailsTemplates',
      label: t('emails.tabs.templates'),
    },
  ])
);

addBreadcrumb(
  computed(() => [
    { title: t('menu.emails'), to: '/admin/emails', icon: faEnvelope },
  ])
);
</script>
