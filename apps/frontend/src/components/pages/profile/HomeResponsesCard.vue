<!--
  # HomeResponsesCard
  The member's own responses on the home page, newest first. Shows the first
  few, and expands in place to show them all once the rest have loaded. If
  they can't be loaded, a toast says so and the list stays as it was.
-->
<template>
  <HomeListCard
    :title="t('homePage.yourResponses')"
    icon="i-lucide-message-square-text"
    :count="t('callouts.data.responses', { n: total }, total)"
    :items="shown"
    :loading="skeleton"
    :error="failed"
    :retry="retry"
    :item-key="(response) => response.id"
    :empty-text="t('homePage.noResponses')"
    :footer-label="footerLabel"
    :footer-icon="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
    :footer-expanded="expanded"
    :footer-loading="loadingAll"
    @footer-click="toggle"
  >
    <template #default="{ item: response }">
      <div class="flex min-w-0 flex-[1_1_12rem] flex-col gap-1">
        <RouterLink
          :to="`/crowdnewsroom/${response.callout.slug}`"
          class="after:absolute after:inset-0 after:content-['']"
        >
          <h4 class="line-clamp-2 text-sm">{{ response.callout.title }}</h4>
        </RouterLink>

        <p class="text-muted">
          {{
            t('homePage.submittedOn', {
              date: formatLocale(response.createdAt, 'd MMM yyyy'),
            })
          }}
        </p>
      </div>

      <RouterLink
        v-if="respondAgainKey(response)"
        :to="`/crowdnewsroom/${response.callout.slug}/respond`"
        class="group/respond relative z-10 inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline"
      >
        {{ t(respondAgainKey(response)!) }}
        <UIcon
          name="i-lucide-chevron-right"
          class="size-4 transition-transform group-hover/respond:translate-x-0.5"
          aria-hidden="true"
        />
      </RouterLink>
    </template>
  </HomeListCard>
</template>

<script lang="ts" setup>
import {
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  ItemStatus,
  type Paginated,
} from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { queryOptions, useQuery } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import HomeListCard from '#components/pages/profile/HomeListCard.vue';
import type { LazyQuery } from '#type';
import { fetchMyResponses } from '#utils/api';
import { getRespondAgainKey } from '#utils/callouts';

/** Props for HomeResponsesCard */
export interface HomeResponsesCardProps {
  /** The member's latest responses, newest first */
  query: LazyQuery<
    Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>>
  >;
}

const props = defineProps<HomeResponsesCardProps>();

const { t } = useI18n();

const { data: latestResponses, skeleton, failed, retry } = props.query;

const totalResponseCount = computed(() => latestResponses.value?.total ?? 0);
const fetchLimit = computed(() => Math.min(totalResponseCount.value, 1000));
const allResponsesQuery = computed(() =>
  queryOptions({
    queryKey: ['callouts', 'responses', 'me', 'all', fetchLimit.value],
    queryFn: () => fetchMyResponses(fetchLimit.value),
  })
);
/** Whether the member has asked to see all their responses */
const wantsAll = ref(false);

const {
  data: allResponses,
  isFetching,
  isError,
  refetch,
} = useQuery(() => ({
  ...allResponsesQuery.value,
  enabled: wantsAll.value,
  meta: { errorToast: t('homePage.loadAllResponsesError') },
}));

// The full list once it's loaded, otherwise the latest few
const loadedResponses = computed(
  () => allResponses.value ?? latestResponses.value
);
const responses = computed(() => loadedResponses.value?.items);
const total = computed(() => loadedResponses.value?.total ?? 0);

const collapsedCount = 3;
/** The list expands once the rest have loaded */
const expanded = computed(() => wantsAll.value && !!allResponses.value);
const loadingAll = computed(
  () => wantsAll.value && !allResponses.value && isFetching.value
);

const shown = computed(() =>
  expanded.value ? responses.value : responses.value?.slice(0, collapsedCount)
);

const footerLabel = computed(() => {
  if (total.value <= collapsedCount) return undefined;
  return expanded.value
    ? t('homePage.showFewer')
    : t('homePage.showAllResponses', { n: total.value });
});

function toggle() {
  if (loadingAll.value) return;

  wantsAll.value = !expanded.value;
  // After a failure the query stays enabled, so asking again tries again
  if (wantsAll.value && isError.value) refetch();
}

const respondAgainKey = (
  response: GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>
) =>
  response.callout.status === ItemStatus.Open
    ? getRespondAgainKey(response.callout)
    : null;
</script>
