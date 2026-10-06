<!--
  # NoticeBanner
  A notice an admin has published to members, on the home page and in the
  admin notice preview. A notice with a link has one way to follow it: the
  button when there's button text, otherwise the whole notice.
-->
<template>
  <div
    class="relative flex flex-wrap items-center gap-4 rounded-md bg-tint-primary p-5 ring ring-primary/20"
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
      <ULink
        v-if="notice.url && !notice.buttonText"
        :to="notice.url"
        raw
        class="after:absolute after:inset-0 after:content-[''] hover:underline"
      >
        {{ notice.text }}
      </ULink>
      <template v-else>{{ notice.text }}</template>
    </p>
    <UButton v-if="notice.url && notice.buttonText" :to="notice.url">
      {{ notice.buttonText }}
    </UButton>
  </div>
</template>

<script lang="ts" setup>
import type { NoticeData } from '@beabee/beabee-common';

defineProps<{
  /** The notice to show */
  notice: NoticeData;
}>();
</script>
