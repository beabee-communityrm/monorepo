<template>
  <div
    v-if="error instanceof NotFoundError"
    class="nuxt-page flex flex-col items-center gap-3 py-16 text-center"
  >
    <p class="text-muted">{{ t('callout.notFound') }}</p>
    <UButton
      v-if="currentUser && !isEmbed"
      color="neutral"
      variant="outline"
      to="/crowdnewsroom"
      class="min-h-11"
    >
      {{ t('callout.seeAll') }}
    </UButton>
  </div>

  <LoadError
    v-else-if="error"
    :retry="reload"
    keypath="callout.loadError"
    class="nuxt-page py-16 text-center"
  />

  <router-view v-else-if="callout" :callout="callout" />
</template>

<script lang="ts">
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { NotFoundError } from '@beabee/client';

import { defineBasicLoader } from 'vue-router/experimental';

import router from '#lib/router';
import { generalContent } from '#store';
import { client } from '#utils/api';
import {
  generateComponentText,
  generateResponseLinks,
  generateSlides,
} from '#utils/callouts';

/** The last CrowdNewsroom loaded, reused while moving between its pages */
let last:
  | {
      id: string;
      lang: unknown;
      callout: GetCalloutDataWith<
        'form' | 'responseViewSchema' | 'variantNames'
      >;
    }
  | undefined;

/**
 * Loads the CrowdNewsroom before its pages are shown, so the current page
 * stays up until it arrives. A missing CrowdNewsroom or a failed request
 * still shows the page, with the error.
 */
export const useCalloutData = defineBasicLoader(
  '/crowdnewsroom/[id]',
  async (to) => {
    const from = router.currentRoute.value;
    if (
      last &&
      last.id === to.params.id &&
      last.lang === to.query.lang &&
      'id' in from.params &&
      from.params.id === to.params.id
    ) {
      return last.callout;
    }
    last = undefined;

    // Load callout with variants to get structured translation data
    const calloutWithVariants = await client.callout.get(
      to.params.id,
      ['form', 'responseViewSchema', 'variantNames', 'variants'],
      to.query.lang ? to.query.lang.toString() : undefined
    );

    // Extract current locale and default locale
    const currentLocale = to.query.lang?.toString() || 'default';
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
    const callout = {
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

    last = { id: to.params.id, lang: to.query.lang, callout };
    return callout;
  },
  { errors: () => true }
);
</script>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import LoadError from '#components/LoadError.vue';
import { currentUser, isEmbed } from '#store';

const { t } = useI18n();

const { data: callout, error, reload } = useCalloutData();
</script>
