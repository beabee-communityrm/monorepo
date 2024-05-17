<route lang="yaml">
name: adminCalloutView
meta:
  pageTitle: menu.callouts
  role: admin
</route>

<template>
  <div v-if="callout">
    <PageTitle border :title="callout.title" no-collapse />
    <router-view :callout="callout"></router-view>
  </div>
</template>

<script lang="ts" setup>
import { faBullhorn } from '@fortawesome/free-solid-svg-icons';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageTitle from '@components/PageTitle.vue';
import { addBreadcrumb } from '@store/breadcrumb';
import { fetchCallout } from '@utils/api/callout';

import type { GetCalloutDataWith } from '@type';

const props = defineProps<{ id: string }>();

const { t } = useI18n();

addBreadcrumb(
  computed(() => [
    { title: t('menu.callouts'), icon: faBullhorn, to: '/admin/callouts' },
    {
      title: callout.value?.title || '',
      to: '/admin/callouts/view/' + props.id,
    },
  ])
);

const callout =
  ref<GetCalloutDataWith<'form' | 'responseCount' | 'responseViewSchema'>>();

onBeforeMount(async () => {
  callout.value = await fetchCallout(props.id, [
    'form',
    'responseCount',
    'responseViewSchema',
  ]);
});
</script>
