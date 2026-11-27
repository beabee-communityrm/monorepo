<!--
  # HomeCalloutsCard
  The open CrowdNewsrooms on the home page, newest first, always with a link to
  the full list and its archive. CrowdNewsrooms the member has already
  responded to stay in the list, marked as such.
-->
<template>
  <HomeListCard
    :title="t('callouts.openCallouts')"
    :icon="routeIcons.callouts"
    :count="t('homePage.openCount', { n: total })"
    :items="callouts"
    :loading="skeleton"
    :error="failed"
    :retry="retry"
    :item-key="(callout) => callout.slug"
    :empty-text="t('homePage.noOpenCallouts')"
    :footer-label="
      callouts && total > callouts.length
        ? t('homePage.seeAllOpen', { n: total })
        : t('homePage.viewAllCallouts')
    "
    footer-to="/crowdnewsroom"
  >
    <template #loading>
      <USkeleton class="h-16.5 w-16 shrink-0 sm:w-22" />
      <div class="flex-1 space-y-2">
        <USkeleton class="h-4 w-2/3" />
        <USkeleton class="h-4 w-1/2" />
      </div>
    </template>

    <template #default="{ item: callout }">
      <img
        :src="getCalloutImageUrl(callout, 200)"
        alt=""
        class="h-16.5 w-16 shrink-0 rounded-md bg-elevated object-cover sm:w-22"
      />

      <div class="flex min-w-0 flex-[1_1_12rem] flex-col gap-3">
        <RouterLink
          :to="`/crowdnewsroom/${callout.slug}`"
          class="after:absolute after:inset-0 after:content-['']"
        >
          <h4 class="line-clamp-2">{{ callout.title }}</h4>
        </RouterLink>

        <CalloutMetaList :callout="callout" />

        <p v-if="callout.excerpt" class="line-clamp-2 text-muted">
          {{ callout.excerpt }}
        </p>
      </div>

      <CalloutRespondLinks :callout="callout" compact class="shrink-0" />
    </template>
  </HomeListCard>
</template>

<script lang="ts" setup>
import type { Paginated } from '@beabee/beabee-common';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import CalloutMetaList from '#components/callout/CalloutMetaList.vue';
import CalloutRespondLinks from '#components/callout/CalloutRespondLinks.vue';
import HomeListCard from '#components/pages/profile/HomeListCard.vue';
import type { CalloutCardData, LazyQuery } from '#type';
import { getCalloutImageUrl } from '#utils/callouts';
import { routeIcons } from '#utils/route-nav';

/** Props for HomeCalloutsCard */
export interface HomeCalloutsCardProps {
  /** The open CrowdNewsrooms, newest first */
  query: LazyQuery<Paginated<CalloutCardData>>;
}

const props = defineProps<HomeCalloutsCardProps>();

const { t } = useI18n();

const { data: page, skeleton, failed, retry } = props.query;

const callouts = computed(() => page.value?.items.slice(0, 3));
const total = computed(() => page.value?.total ?? 0);
</script>
