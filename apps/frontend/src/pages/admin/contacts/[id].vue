<route lang="yaml">
name: adminContactsView
meta:
  pageTitle: menu.contacts
  role: admin
</route>

<template>
  <template v-if="contact">
    <PageTitle class="mb-2" :title="contact.displayName" no-collapse />

    <AppTabs
      :items="tabs"
      :selected="route.name ? (route.name as string) : null"
    />

    <router-view :contact="contact"></router-view>
  </template>
</template>

<script lang="ts" setup>
import type { GetContactData } from '@beabee/beabee-common';
import { AppTabs, PageTitle } from '@beabee/vue';

import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { resolveTabNavigation } from '#utils/navigation';

import env from '../../../env';

const route = useRoute('adminContactsView');
const router = useRouter();
const { t } = useI18n();

const contact = ref<GetContactData | undefined>();

const contributionTab = {
  id: 'adminContactsViewContribution',
  label: t('contactOverview.contribution'),
} as const;

const tabs = computed(() =>
  resolveTabNavigation(
    router,
    [
      {
        id: 'adminContactsViewOverview',
        label: t('contactOverview.overview'),
      },
      {
        id: 'adminContactsViewAccount',
        label: t('contactOverview.account'),
      },
      ...(env.cnrMode ? [] : [contributionTab]),
      {
        id: 'adminContactsViewCallouts',
        label: t('contactOverview.callouts'),
      },
    ],
    {
      params: { id: contact.value?.id || '-' },
    }
  )
);

const selectedTab = computed(() =>
  tabs.value.find((tab) => tab.id === route.name)
);

addBreadcrumb(
  computed(() => [
    {
      title: t('menu.contacts'),
      to: '/admin/contacts',
      icon: faUsers,
    },
    ...(contact.value && selectedTab.value
      ? [
          {
            title: contact.value.displayName,
            to: '/admin/contacts/' + contact.value.id,
          },
          {
            title: selectedTab.value.label,
            to: selectedTab.value.to,
          },
        ]
      : []),
  ])
);

onBeforeMount(async () => {
  contact.value = await client.contact.get(route.params.id);
});
</script>
