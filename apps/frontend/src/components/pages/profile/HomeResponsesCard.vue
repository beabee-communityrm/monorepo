<!--
  # HomeResponsesCard
  The member's own responses on the home page, newest first. Shows the first
  few, and expands in place to show them all.

  `responses` is undefined while loading. Expanding emits `loadAll` so the
  caller can fetch the rest; until they arrive, the card shows what it has.
-->
<template>
  <HomeListCard
    :title="t('homePage.yourResponses')"
    icon="i-lucide-message-square-text"
    :count="t('callouts.data.responses', { n: total }, total)"
    :loading="!responses"
    :empty="responses?.length === 0"
    :empty-text="t('homePage.noResponses')"
    :footer-label="footerLabel"
    :footer-icon="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
    @footer-click="toggle"
  >
    <li
      v-for="response in shown"
      :key="response.id"
      class="relative flex flex-wrap items-start gap-x-4 gap-y-2 p-4 transition-colors hover:bg-elevated"
    >
      <div class="flex min-w-0 flex-[1_1_12rem] flex-col gap-1">
        <RouterLink
          :to="`/crowdnewsroom/${response.callout.slug}`"
          class="after:absolute after:inset-0 after:content-['']"
        >
          <h4 class="line-clamp-2">{{ response.callout.title }}</h4>
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
    </li>
  </HomeListCard>
</template>

<script lang="ts" setup>
import {
  CalloutResponseMode,
  type GetCalloutResponseDataWith,
  type GetCalloutResponseWith,
  ItemStatus,
} from '@beabee/beabee-common';
import { formatLocale } from '@beabee/vue';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import HomeListCard from '#components/pages/profile/HomeListCard.vue';

const props = defineProps<{
  /** The member's responses, newest first; undefined while loading */
  responses:
    | GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>[]
    | undefined;
  /** How many responses the member has in total */
  total: number;
}>();

const emit = defineEmits<{ loadAll: [] }>();

const { t } = useI18n();

const collapsedCount = 3;
const expanded = ref(false);

const shown = computed(() =>
  expanded.value ? props.responses : props.responses?.slice(0, collapsedCount)
);

const footerLabel = computed(() => {
  if (props.total <= collapsedCount) return undefined;
  return expanded.value
    ? t('homePage.showFewer')
    : t('homePage.showAllResponses', { n: props.total });
});

function toggle() {
  expanded.value = !expanded.value;
  if (expanded.value && (props.responses?.length ?? 0) < props.total) {
    emit('loadAll');
  }
}

const isEditable = (
  response: GetCalloutResponseDataWith<GetCalloutResponseWith.Callout>
) =>
  response.callout.status === ItemStatus.Open &&
  response.callout.responseMode === CalloutResponseMode.SingleEditable;
</script>
