<template>
  <router-view v-if="callout" :callout="callout" />
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';

import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { generalContent } from '#store';
import { client } from '#utils/api';
import {
  generateComponentText,
  generateResponseLinks,
  generateSlides,
} from '#utils/callouts';

const callout =
  ref<GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>>();

const route = useRoute('/crowdnewsroom/[id]');

watch(
  [() => route.params.id, () => route.query.lang],
  async () => {
    // Load callout with variants to get structured translation data
    const calloutWithVariants = await client.callout.get(
      route.params.id,
      ['form', 'responseViewSchema', 'variantNames', 'variants'],
      route.query.lang ? route.query.lang.toString() : undefined
    );

    // Extract current locale and default locale
    const currentLocale = route.query.lang?.toString() || 'default';
    const defaultLocale = generalContent.value.locale || 'en';

    // Generate component text with fallback support
    const componentTextWithFallbacks = generateComponentText(
      calloutWithVariants.variants,
      currentLocale,
      defaultLocale
    );

    // Generate slides with navigation fallbacks
    const slidesWithNavigationFallbacks = generateSlides(
      calloutWithVariants.formSchema.slides,
      calloutWithVariants.variants,
      currentLocale,
      defaultLocale
    );

    // Generate response links with fallback support
    const responseLinksWithFallbacks = generateResponseLinks(
      calloutWithVariants.responseViewSchema?.links || [],
      calloutWithVariants.variants,
      currentLocale,
      defaultLocale
    );

    // Create the callout object with enhanced componentText, slide navigation, and response links
    callout.value = {
      ...calloutWithVariants,
      formSchema: {
        ...calloutWithVariants.formSchema,
        componentText: componentTextWithFallbacks,
        slides: slidesWithNavigationFallbacks,
      },
      responseViewSchema: calloutWithVariants.responseViewSchema
        ? {
            ...calloutWithVariants.responseViewSchema,
            links: responseLinksWithFallbacks,
          }
        : null,
    };
  },
  { immediate: true }
);
</script>
