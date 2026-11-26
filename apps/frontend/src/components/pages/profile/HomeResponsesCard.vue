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
import { useToast } from '@nuxt/ui/composables';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import HomeListCard from '#components/pages/profile/HomeListCard.vue';
import type { LazyQuery } from '#type';
import { getRespondAgainKey } from '#utils/callouts';

/** Props for HomeResponsesCard */
export interface HomeResponsesCardProps {
  /** The member's latest responses, newest first */
  query: LazyQuery<
    Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>>
  >;
  /** Loads up to `limit` of the member's responses, newest first */
  loadAll: (
    limit: number
  ) => Promise<
    Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>>
  >;
}

const props = defineProps<HomeResponsesCardProps>();

const { t } = useI18n();
const toast = useToast();

const { data: firstPage, skeleton, failed, retry } = props.query;

/** All the responses, once expanding has loaded the rest */
const allPage =
  ref<Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>>>();

const page = computed(() => allPage.value ?? firstPage.value);
const responses = computed(() => page.value?.items);
const total = computed(() => page.value?.total ?? 0);

const collapsedCount = 3;
const expanded = ref(false);
const loadingAll = ref(false);

const shown = computed(() =>
  expanded.value ? responses.value : responses.value?.slice(0, collapsedCount)
);

const footerLabel = computed(() => {
  if (total.value <= collapsedCount) return undefined;
  return expanded.value
    ? t('homePage.showFewer')
    : t('homePage.showAllResponses', { n: total.value });
});

async function toggle() {
  if (loadingAll.value) return;

  if (!expanded.value && (responses.value?.length ?? 0) < total.value) {
    loadingAll.value = true;
    try {
      allPage.value = await props.loadAll(Math.min(total.value, 1000));
    } catch {
      toast.add({
        title: t('homePage.loadAllResponsesError'),
        color: 'error',
        icon: 'i-lucide-circle-alert',
      });
      return;
    } finally {
      loadingAll.value = false;
    }
  }

  expanded.value = !expanded.value;
}

const respondAgainKey = (
  response: GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>
) =>
  response.callout.status === ItemStatus.Open
    ? getRespondAgainKey(response.callout)
    : null;
</script>
