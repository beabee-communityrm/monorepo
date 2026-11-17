<template>
  <UCard
    class="relative flex flex-col overflow-hidden transition-shadow hover:ring-primary"
    :ui="{
      header: 'p-0 sm:p-0',
      body: 'flex flex-1 flex-col gap-3 p-4',
      footer: 'p-0 sm:p-0',
    }"
  >
    <template #header>
      <div class="h-36 bg-elevated">
        <img class="h-full w-full object-cover" :src="imageUrl" alt="" />
      </div>
    </template>

    <RouterLink
      :to="`/crowdnewsroom/${callout.slug}`"
      class="after:absolute after:inset-0 after:content-['']"
    >
      <h3 class="line-clamp-2">
        {{ callout.title }}
      </h3>
    </RouterLink>
    <CalloutMetaList :callout="callout" />

    <p v-if="callout.excerpt" class="line-clamp-2 text-muted">
      {{ callout.excerpt }}
    </p>

    <CalloutRespondLinks
      v-if="!callout.hasAnswered"
      :callout="callout"
      class="mt-auto pt-1"
    />

    <template v-if="callout.hasAnswered" #footer>
      <CalloutRespondLinks :callout="callout" class="bg-primary/5 px-4 py-2" />
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import CalloutMetaList from '#components/callout/CalloutMetaList.vue';
import CalloutRespondLinks from '#components/callout/CalloutRespondLinks.vue';
import { getCalloutImageUrl } from '#utils/callouts';
import type { CalloutCardData } from '#type';

const props = defineProps<{
  callout: CalloutCardData;
}>();

const imageUrl = computed(() => getCalloutImageUrl(props.callout, 900));
</script>
