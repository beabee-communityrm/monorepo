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
import { AppTabs } from '@beabee/vue/components';

import PageTitle from '@components/PageTitle.vue';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import env from '../../../env';

const props = defineProps<{ id: string }>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const contact = ref<GetContactData | undefined>();

const tabs = computed(() =>
  [
    {
      id: 'adminContactsViewOverview',
      label: t('contactOverview.overview'),
    },
    {
      id: 'adminContactsViewAccount',
      label: t('contactOverview.account'),
    },
    ...(env.cnrMode
      ? []
      : [
          {
            id: 'adminContactsViewContribution',
            label: t('contactOverview.contribution'),
          },
        ]),
    {
      id: 'adminContactsViewCallouts',
      label: t('contactOverview.callouts'),
    },
  ].map((item) => ({
    ...item,
    to: router.resolve({
      name: item.id,
      params: { id: contact.value?.id || '-' },
    }).href,
  }))
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
  contact.value = await client.contact.get(props.id);
});
</script>
