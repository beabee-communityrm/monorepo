<!--
  # HomeCalloutsCard
  The open CrowdNewsrooms on the home page, newest first, with a link to the
  full list when there are more than are shown. CrowdNewsrooms the member has
  already responded to stay in the list, marked as such.
-->
<template>
  <HomeListCard
    :title="t('callouts.openCallouts')"
    :icon="routeIcons.callouts"
    :count="t('homePage.openCount', { n: total })"
    :items="callouts"
    :error="error"
    :item-key="(callout) => callout.slug"
    :empty-text="t('homePage.noOpenCallouts')"
    :footer-label="
      callouts && total > callouts.length
        ? t('homePage.seeAllOpen', { n: total })
        : undefined
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
import { ItemStatus, type Paginated } from '@beabee/beabee-common';

import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import CalloutMetaList from '#components/callout/CalloutMetaList.vue';
import CalloutRespondLinks from '#components/callout/CalloutRespondLinks.vue';
import HomeListCard from '#components/pages/profile/HomeListCard.vue';
import { client } from '#utils/api';
import { getCalloutImageUrl } from '#utils/callouts';
import { routeIcons } from '#utils/route-nav';
import type { CalloutCardData } from '#type';

const { t } = useI18n();

const page = ref<Paginated<CalloutCardData>>();
const error = ref(false);

const callouts = computed(() => page.value?.items);
const total = computed(() => page.value?.total ?? 0);

onBeforeMount(async () => {
  try {
    page.value = await client.callout.list(
      {
        order: 'DESC',
        sort: 'starts',
        limit: 3,
        rules: {
          condition: 'AND',
          rules: [
            { field: 'status', operator: 'equal', value: [ItemStatus.Open] },
            { field: 'hidden', operator: 'equal', value: [false] },
          ],
        },
      },
      ['hasAnswered', 'responseCount']
    );
  } catch {
    error.value = true;
  }
});
</script>
