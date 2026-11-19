<template>
  <router-view v-if="callout" :callout="callout" />

  <div
    v-else-if="notFound"
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
    :retry="load"
    keypath="callout.loadError"
    class="nuxt-page py-16 text-center"
  />

  <div
    v-else-if="skeleton"
    class="nuxt-page mx-auto flex w-full max-w-[720px] flex-col gap-6"
  >
    <USkeleton v-if="skeleton === 'details'" class="h-7 w-28 bg-accented" />
    <USkeleton class="h-7 w-2/3 bg-accented" />

    <template v-if="skeleton === 'details'">
      <USkeleton class="aspect-video w-full bg-accented" />
      <div class="space-y-2">
        <USkeleton class="h-4 w-full bg-accented" />
        <USkeleton class="h-4 w-full bg-accented" />
        <USkeleton class="h-4 w-2/3 bg-accented" />
      </div>
      <USkeleton class="h-12 w-full bg-accented" />
    </template>

    <UCard v-else-if="skeleton === 'respond'" :ui="{ body: 'space-y-6' }">
      <div v-for="n in 3" :key="n" class="space-y-2">
        <USkeleton class="h-4 w-1/3" />
        <USkeleton class="h-10 w-full" />
      </div>
      <USkeleton class="h-10 w-28" />
    </UCard>

    <template v-else>
      <USkeleton class="h-16 w-full bg-accented" />
      <div class="flex flex-col gap-3">
        <USkeleton class="h-7 w-36 bg-accented" />
        <USkeleton class="h-56 w-full bg-accented" />
      </div>
      <USkeleton class="h-20 w-full bg-accented" />
    </template>
  </div>
</template>
<script lang="ts" setup>
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { NotFoundError } from '@beabee/client';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import LoadError from '#components/LoadError.vue';
import { currentUser, generalContent, isEmbed } from '#store';
import { client } from '#utils/api';
import {
  generateComponentText,
  generateResponseLinks,
  generateSlides,
} from '#utils/callouts';

const callout =
  ref<GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>>();

const notFound = ref(false);
const error = ref(false);

const { t } = useI18n();
const route = useRoute();

const skeleton = computed(() => {
  switch (route.name) {
    case 'calloutRespond':
      return 'respond';
    case 'calloutThanks':
      return 'thanks';
    case 'calloutGallery':
    case 'calloutMap':
      return null;
    default:
      return isEmbed ? 'respond' : 'details';
  }
});

const load = async () => {
  let calloutWithVariants;
  try {
    // Load callout with variants to get structured translation data
    calloutWithVariants = await client.callout.get(
      route.params.id,
      ['form', 'responseViewSchema', 'variantNames', 'variants'],
      route.query.lang ? route.query.lang.toString() : undefined
    );
  } catch (err) {
    if (!(err instanceof NotFoundError)) throw err;
    callout.value = undefined;
    notFound.value = true;
    error.value = false;
    return;
  }

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
  error.value = false;
};

watch(
  [() => route.params.id, () => route.query.lang],
  () => {
    notFound.value = false;
    error.value = false;
    load().catch(() => {
      callout.value = undefined;
      error.value = true;
    });
  },
  { immediate: true }
);
</script>
