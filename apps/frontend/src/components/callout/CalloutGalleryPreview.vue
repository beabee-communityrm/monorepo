<template>
  <CalloutPreviewCard
    icon="i-lucide-image"
    :title="t('callout.galleryPreview.title')"
    :view-all-to="galleryTo"
    :view-all-label="t('callout.galleryPreview.viewGallery')"
  >
    <div class="grid grid-cols-2 gap-3.5 p-4 sm:grid-cols-3">
      <RouterLink
        v-for="item in items"
        :key="item.number"
        :to="{ ...galleryTo, hash: `#response-${item.number}` }"
        class="group border-default hover:border-primary flex flex-col overflow-hidden rounded-lg border transition-colors"
      >
        <img
          class="bg-elevated aspect-video w-full object-cover"
          loading="lazy"
          :src="resolveImageUrl(item.photo, 400)"
        />
        <div class="p-3">
          <span class="text-highlighted line-clamp-2 text-sm font-semibold">
            {{ item.title }}
          </span>
        </div>
      </RouterLink>
    </div>
  </CalloutPreviewCard>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';

import CalloutPreviewCard from '#components/callout/CalloutPreviewCard.vue';
import { resolveImageUrl } from '#utils/url';

/** Props for CalloutGalleryPreview */
export interface CalloutGalleryPreviewProps {
  /** Link to the full gallery page */
  galleryTo: { path: string };
  /** Sample of gallery responses to show */
  items: { number: number; title: string; photo: string }[];
}

defineProps<CalloutGalleryPreviewProps>();

const { t } = useI18n();
</script>
