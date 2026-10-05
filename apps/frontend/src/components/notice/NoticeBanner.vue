<!--
  # NoticeBanner
  A notice an admin has published to members, on the home page and in the
  admin notice preview. A notice with a link but no button text gets "Find out
  more", so the link is never lost.
-->
<template>
  <div
    class="flex flex-wrap items-center gap-4 rounded-md bg-tint-primary p-5 ring ring-primary/20"
  >
    <div
      class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary"
    >
      <UIcon
        name="i-lucide-send"
        class="size-5 text-inverted"
        aria-hidden="true"
      />
    </div>
    <p class="min-w-0 flex-[1_1_14rem] text-base font-medium text-highlighted">
      {{ notice.text }}
    </p>
    <UButton v-if="notice.url" :to="notice.url">
      {{ notice.buttonText || t('actions.findOutMore') }}
    </UButton>
  </div>
</template>

<script lang="ts" setup>
import type { NoticeData } from '@beabee/beabee-common';

import { useI18n } from 'vue-i18n';

defineProps<{
  /** The notice to show */
  notice: NoticeData;
}>();

const { t } = useI18n();
</script>
