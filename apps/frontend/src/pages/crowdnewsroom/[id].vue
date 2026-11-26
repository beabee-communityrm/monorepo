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
import { NotFoundError } from '@beabee/client';

import { queryOptions } from '@tanstack/vue-query';

import { routeQuery } from '#lib/route-queries';
import type { RouteQueries } from '#type';
import { generalContent } from '#store';
import { client } from '#utils/api';
import {
  generateComponentText,
  generateResponseLinks,
  generateSlides,
} from '#utils/callouts';

/**
 * A CrowdNewsroom with its form, in the language asked for, with fallbacks
 * for text missing in that language
 *
 * @param id The CrowdNewsroom's id, as in its URL
 * @param lang The language asked for in the URL, if any
 */
const calloutQuery = (id: string, lang: string | undefined) =>
  queryOptions({
    queryKey: ['callout', id, { lang }],
    queryFn: async () => {
      // Load callout with variants to get structured translation data
      const calloutWithVariants = await client.callout.get(
        id,
        ['form', 'responseViewSchema', 'variantNames', 'variants'],
        lang
      );

      // Extract current locale and default locale
      const currentLocale = lang || 'default';
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
      return {
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
  });

/**
 * Loads the CrowdNewsroom before its pages are shown, so the current page
 * stays up until it arrives. A missing CrowdNewsroom or a failed request
 * still shows the page, with the error.
 */
export const routeQueries: RouteQueries = (to) => {
  if (!('id' in to.params)) return [];
  const query = calloutQuery(to.params.id, to.query.lang?.toString());
  return [routeQuery(query, { wait: true })];
};
</script>

<script lang="ts" setup>
import { useQuery } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import LoadError from '#components/LoadError.vue';
import { trackQueryReader } from '#lib/dev-panel';
import { currentUser, isEmbed } from '#store';

const { t } = useI18n();
const route = useRoute('/crowdnewsroom/[id]');

const options = () =>
  calloutQuery(route.params.id, route.query.lang?.toString());
const { data: callout, error, refetch } = useQuery(options);
trackQueryReader(() => options().queryKey);

/** Loads the CrowdNewsroom again; rejects if it still fails */
async function reload() {
  const result = await refetch();
  if (result.isError) throw result.error;
}
</script>
