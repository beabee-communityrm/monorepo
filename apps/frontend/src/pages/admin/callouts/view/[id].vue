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
import { addBreadcrumb } from '@store/breadcrumb';
import { client } from '@utils/api';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const route = useRoute('adminCalloutView');
const { t } = useI18n();

// Extract id from route params
const id = computed(() => route.params.id);

addBreadcrumb(
  computed(() => [
    { title: t('menu.callouts'), icon: faBullhorn, to: '/admin/callouts' },
    {
      title: callout.value?.title || '',
      to: '/admin/callouts/view/' + id.value,
    },
  ])
);

const callout =
  ref<GetCalloutDataWith<'form' | 'responseCount' | 'responseViewSchema'>>();

onBeforeMount(async () => {
  callout.value = await client.callout.get(id.value, [
    'form',
    'responseCount',
    'responseViewSchema',
  ]);
});
</script>
