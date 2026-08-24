<route lang="yaml">
name: callouts
meta:
  pageTitle: menu.callouts
</route>

<template>
  <div class="nuxt-page">
    <template v-if="activeCallouts">
      <h2 class="sr-only">{{ t('callouts.openCallouts') }}</h2>
      <div
        v-if="activeCallouts.items.length > 0"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <CalloutCard
          v-for="callout in activeCallouts.items"
          :key="callout.slug"
          :callout="callout"
        />
      </div>
      <p v-else class="text-muted py-16 text-center">
        {{ t('callouts.empty.active') }}
      </p>
    </template>

    <div class="mt-10">
      <CalloutArchivePanel />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ItemStatus, type Paginated } from '@beabee/beabee-common';

import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CalloutArchivePanel from '#components/callout/CalloutArchivePanel.vue';
import CalloutCard from '#components/callout/CalloutCard.vue';
import { addBreadcrumb } from '#store/breadcrumb';
import { client } from '#utils/api';
import { routeIcons, routeLabels } from '#utils/route-nav';
import type { CalloutCardData } from '#type';

const { t } = useI18n();

addBreadcrumb(
  computed(() => [
    {
      label: t(routeLabels.callouts),
      to: '/crowdnewsroom',
      icon: routeIcons.callouts,
    },
  ])
);

const activeCallouts = ref<Paginated<CalloutCardData>>();

onBeforeMount(async () => {
  activeCallouts.value = await client.callout.list(
    {
      sort: 'starts',
      order: 'DESC',
      rules: {
        condition: 'AND',
        rules: [
          { field: 'status', operator: 'equal', value: [ItemStatus.Open] },
          { field: 'hidden', operator: 'equal', value: [false] },
        ],
      },
    },
    ['hasAnswered', 'responseCount', 'responseViewSchema']
  );
});
</script>
