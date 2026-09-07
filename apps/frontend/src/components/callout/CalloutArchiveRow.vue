<template>
  <RouterLink
    :to="`/crowdnewsroom/${callout.slug}`"
    class="group flex items-center gap-4 p-3 transition-colors hover:bg-elevated"
  >
    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-highlighted">
        {{ callout.title }}
      </p>
      <CalloutMetaList :callout="callout" show-end-date class="mt-0.5" />
    </div>

    <UBadge
      v-if="callout.hasAnswered"
      color="success"
      variant="subtle"
      class="shrink-0"
    >
      <UIcon name="i-lucide-check" class="size-3" />
      {{ t('callouts.showAnswered') }}
    </UBadge>

    <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0 text-dimmed" />
  </RouterLink>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import CalloutMetaList from '#components/callout/CalloutMetaList.vue';
import type { CalloutCardData } from '#type';

defineProps<{
  callout: CalloutCardData;
}>();

const { t } = useI18n();
</script>
