<route lang="yaml">
name: adminCalloutView
meta:
  pageTitle: menu.callouts
</route>

<template>
  <div v-if="callout">
    <PageTitle border :title="callout.title" no-collapse />
    <router-view :callout="callout"></router-view>
  </div>
</template>

<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { PageTitle } from '@beabee/vue';

import { faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';

const route = useRoute('adminCalloutView');
const { t } = useI18n();

addBreadcrumb(
  computed(() => [
    {
      title: t('menu.callouts'),
      icon: faBullhorn,
      to: '/admin/crowdnewsroom',
    },
    {
      title: callout.value?.title || '',
      to: '/admin/crowdnewsroom/view/' + route.params.id,
    },
  ])
);

const callout =
  ref<GetCalloutDataWith<'form' | 'responseCount' | 'responseViewSchema'>>();

onBeforeMount(async () => {
  callout.value = await client.callout.get(route.params.id, [
    'form',
    'responseCount',
    'responseViewSchema',
  ]);
});
</script>
