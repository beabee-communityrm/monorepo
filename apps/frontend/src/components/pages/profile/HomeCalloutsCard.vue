<!--
  # HomeCalloutsCard
  The open CrowdNewsrooms on the home page, newest first, with a link to the
  full list when there are more than are shown. CrowdNewsrooms the member has
  already responded to stay in the list, marked as such.

  `callouts` is undefined while loading.
-->
<template>
  <UCard
    :ui="{
      header: 'flex items-center justify-between gap-3 sm:px-4',
      body: 'p-0 sm:p-0',
      footer: 'p-0 sm:p-0',
    }"
  >
    <template #header>
      <h3>{{ t('callouts.openCallouts') }}</h3>
      <span v-if="callouts" class="text-muted">
        {{ t('homePage.openCount', { n: total }) }}
      </span>
    </template>

    <ul v-if="!callouts" class="divide-y divide-default">
      <li v-for="n in 2" :key="n" class="flex gap-4 p-4">
        <USkeleton class="h-16.5 w-16 shrink-0 sm:w-22" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-4 w-2/3" />
          <USkeleton class="h-4 w-1/2" />
        </div>
      </li>
    </ul>

    <p v-else-if="callouts.length === 0" class="p-4 text-muted">
      {{ t('homePage.noOpenCallouts') }}
    </p>

    <ul v-else class="divide-y divide-default">
      <li
        v-for="callout in callouts"
        :key="callout.slug"
        class="relative flex flex-wrap items-start gap-x-4 gap-y-3 p-4 transition-colors hover:bg-elevated"
      >
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
      </li>
    </ul>

    <template v-if="callouts && total > callouts.length" #footer>
      <RouterLink
        to="/crowdnewsroom"
        class="group/all flex items-center gap-1 px-4 py-3 font-medium text-primary hover:bg-elevated"
      >
        {{ t('homePage.seeAllOpen', { n: total }) }}
        <UIcon
          name="i-lucide-chevron-right"
          class="size-4 transition-transform group-hover/all:translate-x-0.5"
          aria-hidden="true"
        />
      </RouterLink>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import CalloutMetaList from '#components/callout/CalloutMetaList.vue';
import CalloutRespondLinks from '#components/callout/CalloutRespondLinks.vue';
import { getCalloutImageUrl } from '#utils/callouts';
import type { CalloutCardData } from '#type';

defineProps<{
  /** Open CrowdNewsrooms to show; undefined while loading */
  callouts: CalloutCardData[] | undefined;
  /** How many CrowdNewsrooms are open in total */
  total: number;
}>();

const { t } = useI18n();
</script>
