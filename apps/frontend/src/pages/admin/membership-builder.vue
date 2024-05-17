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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageTitle from '../../components/PageTitle.vue';
import AppTabs from '../../components/tabs/AppTabs.vue';
import { useRoute, useRouter } from 'vue-router';
import { addBreadcrumb } from '../../store/breadcrumb';
import { faHandsHelping } from '@fortawesome/free-solid-svg-icons';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const tabs = ref(
  [
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
      id: 'adminMembershipBuilderEmail',
      label: t('membershipBuilder.steps.emails.title'),
    },
  ].map((item) => ({
    ...item,
    to: router.resolve({ name: item.id }).href,
  }))
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
