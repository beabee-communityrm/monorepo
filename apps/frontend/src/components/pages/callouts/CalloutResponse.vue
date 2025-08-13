<template>
  <div v-if="callout.responseViewSchema">
    <h2 class="mb-4 font-title text-2xl font-bold">{{ response.title }}</h2>
    <div
      v-if="response.photos.length > 0"
      class="relative -mx-4 mb-4 overflow-hidden"
    >
      <ul
        class="flex items-center transition-transform"
        :style="{ transform: `translateX(${currentPhotoIndex * -100}%)` }"
      >
        <li
          v-for="photo in response.photos"
          :key="photo.url"
          class="w-full flex-none p-4"
        >
          <img
            class="max-h-[300px] w-full object-contain"
            :style="{ filter: callout.responseViewSchema.imageFilter }"
            :src="photo.url + '?w=600&h=600'"
          />
        </li>
      </ul>
      <div
        v-if="response.photos.length > 1"
        class="absolute inset-x-0 top-1/2 flex -translate-y-1/2 transform justify-between text-2xl font-bold"
      >
        <div>
          <button
            v-show="currentPhotoIndex > 0"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"
            @click="currentPhotoIndex--"
          >
            <font-awesome-icon :icon="faChevronLeft" />
          </button>
        </div>
        <div>
          <button
            v-show="currentPhotoIndex < response.photos.length - 1"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"
            @click="currentPhotoIndex++"
          >
            <font-awesome-icon :icon="faChevronRight" />
          </button>
        </div>
      </div>
    </div>

    <CalloutForm
      :key="response.number"
      :callout="viewOnlyCallout"
      :answers="response.answers"
      readonly
      all-slides
      no-bg
      :style="'simple'"
    />

    <ul
      v-if="localizedResponseLinks.length > 0"
      class="mt-8 columns-2 gap-4 border-t border-t-primary pt-8"
    >
      <li
        v-for="link in localizedResponseLinks"
        :key="link.url"
        class="break-inside-avoid"
      >
        <a
          class="block font-title font-bold text-link underline"
          :href="link.url"
          target="_blank"
        >
          {{ link.text }}
        </a>
      </li>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import {
  type GetCalloutDataWith,
  type GetCalloutResponseMapData,
  filterComponents,
} from '@beabee/beabee-common';

import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { generalContent } from '@store';
import { generateResponseLinksWithFallbacks } from '@utils/callouts';
import CalloutForm from './CalloutForm.vue';

const props = defineProps<{
  callout: GetCalloutDataWith<'form' | 'responseViewSchema' | 'variants'>;
  response: GetCalloutResponseMapData;
}>();

const { locale } = useI18n();
const currentPhotoIndex = ref(0);

// Generate localized response links with fallback support
const localizedResponseLinks = computed(() => {
  if (!props.callout.responseViewSchema?.links) return [];
  
  return generateResponseLinksWithFallbacks(
    props.callout.responseViewSchema.links,
    props.callout.variants,
    locale.value,
    generalContent.value.locale || 'en'
  );
});

// Don't show admin-only fields (they would always be empty as the API doesn't return their answers)
const viewOnlyCallout = computed(() => ({
  ...props.callout,
  formSchema: {
    ...props.callout.formSchema,
    slides: props.callout.formSchema.slides.map((slide) => ({
      ...slide,
      components: filterComponents(slide.components, (c) => !c.adminOnly),
    })),
  },
}));

watch(
  () => props.response,
  () => {
    currentPhotoIndex.value = 0;
  }
);
</script>
