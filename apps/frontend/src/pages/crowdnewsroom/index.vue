<route lang="yaml">
name: callouts
meta:
  pageTitle: menu.callouts
</route>

<template>
  <div class="nuxt-page">
    <h2 class="sr-only">{{ t('callouts.openCallouts') }}</h2>

    <LoadError
      v-if="failed"
      :retry="retry"
      keypath="callouts.loadOpenError"
      class="py-16 text-center"
    />

    <p
      v-else-if="activeCallouts?.items.length === 0"
      class="py-16 text-center text-muted"
    >
      {{ t('callouts.empty.active') }}
    </p>

    <div
      v-else-if="skeleton || activeCallouts"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <template v-if="skeleton">
        <UCard
          v-for="n in 4"
          :key="n"
          :ui="{ header: 'p-0 sm:p-0', body: 'flex flex-col gap-3 p-4' }"
        >
          <template #header>
            <USkeleton class="h-36 rounded-none" />
          </template>
          <USkeleton class="h-5 w-3/4" />
          <USkeleton class="h-4 w-1/2" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-2/3" />
        </UCard>
      </template>

      <CalloutCard
        v-for="callout in activeCallouts?.items"
        v-else
        :key="callout.slug"
        :callout="callout"
      />
    </div>

    <div class="mt-10">
      <CalloutArchivePanel />
    </div>
  </div>
</template>

<script lang="ts">
export {
  useArchivedCalloutsData,
  useArchivedTotalData,
  useOpenCalloutsData,
} from '#components/pages/callouts/use-callout-list';
</script>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import CalloutArchivePanel from '#components/callout/CalloutArchivePanel.vue';
import CalloutCard from '#components/callout/CalloutCard.vue';
import LoadError from '#components/LoadError.vue';
import { useOpenCalloutsData } from '#components/pages/callouts/use-callout-list';
import { useLazyLoad } from '#composables/useLazyLoad';
import { addBreadcrumb } from '#store/breadcrumb';
import { routeIcons, routeLabels } from '#utils/route-nav';

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

const {
  data: activeCallouts,
  skeleton,
  failed,
  retry,
} = useLazyLoad(useOpenCalloutsData());
</script>
