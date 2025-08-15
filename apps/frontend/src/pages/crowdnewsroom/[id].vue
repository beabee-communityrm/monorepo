<template>
  <router-view v-if="callout" :callout="callout" />
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';

import { generalContent } from '@store';
import { client } from '@utils/api';
import {
  generateComponentText,
  generateResponseLinks,
  generateSlides,
} from '@utils/callouts';
import { ref } from 'vue';
import { watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{ id: string }>();
const callout =
  ref<
    GetCalloutDataWith<
      'form' | 'responseViewSchema' | 'variantNames' | 'variants'
    >
  >();

const route = useRoute();

watch(
  [() => props.id, () => route.query.lang],
  async () => {
    // Load callout with variants to get structured translation data
    const calloutWithVariants = await client.callout.get(
      props.id,
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
