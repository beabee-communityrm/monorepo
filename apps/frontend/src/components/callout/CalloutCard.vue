<template>
  <UCard
    class="group hover:ring-primary relative flex flex-col overflow-hidden transition-shadow"
    :ui="{
      header: 'p-0 sm:p-0',
      body: 'flex flex-1 flex-col gap-3 p-4',
      footer: 'p-0 sm:p-0',
    }"
  >
    <template #header>
      <div class="bg-elevated h-36">
        <img
          class="h-full w-full object-cover"
          :src="imageUrl"
          :alt="callout.title"
        />
      </div>
    </template>

    <div v-if="daysLeft !== null" class="flex items-center">
      <UBadge color="neutral" variant="subtle">
        <UIcon name="i-lucide-clock" class="size-3" />
        <i18n-t keypath="callouts.daysLeft" :plural="daysLeft">
          <template #n>{{ daysLeft }}</template>
        </i18n-t>
      </UBadge>
    </div>

    <RouterLink
      :to="`/crowdnewsroom/${callout.slug}`"
      class="after:absolute after:inset-0 after:content-['']"
    >
      <h3 class="line-clamp-2">
        {{ callout.title }}
      </h3>
    </RouterLink>
    <p v-if="callout.excerpt" class="text-muted line-clamp-2">
      {{ callout.excerpt }}
    </p>

    <CalloutMetaList :callout="callout" />

    <RouterLink
      v-if="!callout.hasAnswered"
      :to="`/crowdnewsroom/${callout.slug}/respond`"
      class="group/respond text-primary relative z-10 mt-auto inline-flex items-center gap-1 self-start pt-1 font-medium hover:underline"
    >
      {{ t('actions.participate') }}
      <UIcon
        name="i-lucide-chevron-right"
        class="size-4 transition-transform group-hover/respond:translate-x-0.5"
      />
    </RouterLink>

    <template v-if="callout.hasAnswered" #footer>
      <div
        class="bg-primary/5 text-primary flex flex-col gap-1 px-4 py-2 font-medium"
      >
        <div class="flex items-center gap-1.5">
          <UIcon name="i-lucide-check" class="size-3 shrink-0" />
          {{ t('callout.youResponded') }}
        </div>
        <RouterLink
          v-if="respondAgainKey"
          :to="`/crowdnewsroom/${callout.slug}/respond`"
          class="group/respond relative z-10 inline-flex items-center gap-1.5 self-start hover:underline"
        >
          <span class="size-3 shrink-0" />
          <span class="flex items-center gap-1">
            {{ t(respondAgainKey) }}
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 transition-transform group-hover/respond:translate-x-0.5"
            />
          </span>
        </RouterLink>
      </div>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import CalloutMetaList from '#components/callout/CalloutMetaList.vue';
import { resolveImageUrl } from '#utils/url';
import type { CalloutCardData } from '#type';

import noImage from '../../assets/images/no-image.avif';

const props = defineProps<{
  callout: CalloutCardData;
}>();

const { t } = useI18n();

const imageUrl = computed(() =>
  props.callout.image ? resolveImageUrl(props.callout.image, 900) : noImage
);

const respondAgainKey = computed(() => {
  if (props.callout.allowUpdate) return 'callout.actions.updateResponse';
  if (props.callout.allowMultiple) return 'callout.actions.participateAgain';
  return null;
});

const daysLeft = computed(() => {
  if (!props.callout.expires) return null;
  const days = Math.ceil(
    (props.callout.expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return days > 0 ? days : null;
});
</script>
