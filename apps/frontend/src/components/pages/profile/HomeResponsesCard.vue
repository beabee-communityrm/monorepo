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
    :error="error"
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

import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import HomeListCard from '#components/pages/profile/HomeListCard.vue';
import { client } from '#utils/api';
import { getRespondAgainKey } from '#utils/callouts';

const { t } = useI18n();
const toast = useToast();

const page =
  ref<Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>>>();
const error = ref(false);

const responses = computed(() => page.value?.items);
const total = computed(() => page.value?.total ?? 0);

const fetchResponses = (limit: number) =>
  client.callout.response.list(
    {
      sort: 'createdAt',
      order: 'DESC',
      limit,
      rules: {
        condition: 'AND',
        rules: [{ field: 'contact', operator: 'equal', value: ['me'] }],
      },
    },
    [GetCalloutResponseWith.Callout]
  );

onBeforeMount(async () => {
  try {
    page.value = await fetchResponses(3);
  } catch {
    error.value = true;
  }
});

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
      page.value = await fetchResponses(Math.min(total.value, 1000));
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
