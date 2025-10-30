<route lang="yaml">
name: adminMembershipBuilder
meta:
  pageTitle: membershipBuilder.title
  role: admin
</route>

<template>
  <PageTitle :title="t('membershipBuilder.title')" />
  <AppTabs
    :items="tabs"
    :selected="route.name ? (route.name as string) : null"
  />
  <router-view />
</template>
<script lang="ts" setup>
import { AppTabs, PageTitle } from '@beabee/vue';

import { faHandsHelping } from '@fortawesome/free-solid-svg-icons';
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
      id: 'adminMembershipBuilderJoinForm',
      label: t('membershipBuilder.steps.joinForm.title'),
    },
    {
      id: 'adminMembershipBuilderAccountConfirmation',
      label: t('membershipBuilder.steps.accountConfirmation.title'),
    },
    {
      id: 'adminMembershipBuilderIntroMessages',
      label: t('membershipBuilder.steps.intro.title'),
    },
    {
      id: '/admin/membership-builder/email',
      label: t('membershipBuilder.steps.emails.title'),
    },
  ])
);

const selectedTab = computed(() =>
  tabs.value.find((tab) => tab.id === route.name)
);

addBreadcrumb(
  computed(() => [
    {
      title: t('membershipBuilder.title'),
      to: '/admin/membership-builder',
      icon: faHandsHelping,
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
