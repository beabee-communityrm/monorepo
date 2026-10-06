<!--
  # HomeResponsesCard
  The member's own responses on the home page, newest first. Shows the first
  few, and expands in place to show them all, fetching the rest; until they
  arrive, the card shows what it has.
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
        v-if="isEditable(response)"
        :to="`/crowdnewsroom/${response.callout.slug}/respond`"
        class="group/respond relative z-10 inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline"
      >
        {{ t('callout.actions.updateResponse') }}
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
  CalloutResponseMode,
  type GetCalloutResponseDataWith,
  GetCalloutResponseWith,
  ItemStatus,
  type Paginated,
} from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import HomeListCard from '#components/pages/profile/HomeListCard.vue';
import { client } from '#utils/api';

const { t } = useI18n();

const page =
  ref<Paginated<GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>>>();
const error = ref(false);

const responses = computed(() => page.value?.items);
const total = computed(() => page.value?.total ?? 0);

async function load(limit: number) {
  try {
    page.value = await client.callout.response.list(
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
  } catch {
    error.value = true;
  }
}

onBeforeMount(() => load(3));

const collapsedCount = 3;
const expanded = ref(false);

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
  expanded.value = !expanded.value;
  if (expanded.value && (responses.value?.length ?? 0) < total.value) {
    load(Math.min(total.value, 1000));
  }
}

const isEditable = (
  response: GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>
) =>
  response.callout.status === ItemStatus.Open &&
  response.callout.responseMode === CalloutResponseMode.SingleEditable;
</script>
