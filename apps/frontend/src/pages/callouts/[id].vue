<template>
  <router-view v-if="callout" :callout="callout" />
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { client } from '@utils/api';
import { watch } from 'vue';
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { generateComponentTextWithFallbacks } from '@utils/callouts';
import { generalContent } from '@store';

const props = defineProps<{ id: string }>();
const callout =
  ref<GetCalloutDataWith<'form' | 'responseViewSchema' | 'variantNames'>>();

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
    const componentTextWithFallbacks = generateComponentTextWithFallbacks(
      calloutWithVariants.variants,
      currentLocale,
      defaultLocale
    );

    // Create the callout object with enhanced componentText
    callout.value = {
      ...calloutWithVariants,
      formSchema: {
        ...calloutWithVariants.formSchema,
        componentText: componentTextWithFallbacks,
      },
    };
  },
  { immediate: true }
);
</script>
