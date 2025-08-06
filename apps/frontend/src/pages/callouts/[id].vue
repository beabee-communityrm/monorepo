<template>
  <router-view v-if="callout" :callout="callout" />
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';

import { generalContent } from '@store';
import { client } from '@utils/api';
import {
  generateComponentTextWithFallbacks,
  generateSlidesWithNavigationFallbacks,
} from '@utils/callouts';
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const callout =
  ref<GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>>();

const route = useRoute('/callouts/[id]');
// Extract id from route params
const id = computed(() => route.params.id);

watch(
  [() => id.value, () => route.query.lang],
  async () => {
    // Load callout with variants to get structured translation data
    const calloutWithVariants = await client.callout.get(
      id.value,
      ['form', 'responseViewSchema', 'variantNames', 'variants'],
      route.query.lang ? route.query.lang.toString() : undefined
    );

    // Extract current locale and default locale
    const currentLocale = route.query.lang?.toString() || 'default';
    const defaultLocale = generalContent.value.locale || 'en';

    // Generate component text with fallback support
    const componentTextWithFallbacks = generateComponentTextWithFallbacks(
      calloutWithVariants.variants,
      currentLocale,
      defaultLocale
    );

    // Generate slides with navigation fallbacks
    const slidesWithNavigationFallbacks = generateSlidesWithNavigationFallbacks(
      calloutWithVariants.formSchema.slides,
      calloutWithVariants.variants,
      currentLocale,
      defaultLocale
    );

    // Create the callout object with enhanced componentText and slide navigation
    callout.value = {
      ...calloutWithVariants,
      formSchema: {
        ...calloutWithVariants.formSchema,
        componentText: componentTextWithFallbacks,
        slides: slidesWithNavigationFallbacks,
      },
    };
  },
  { immediate: true }
);
</script>
