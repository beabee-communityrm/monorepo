<!--
  # CalloutLanguageSelect
  Language switcher for a CrowdNewsroom with more than one variant. Renders
  nothing when there is only one. Selecting a language writes the `lang` query
  param — see `useCalloutVariants`.
-->
<template>
  <USelect
    v-if="variantItems.length > 1"
    v-model="currentVariant"
    :items="variantItems"
    value-key="id"
    icon="i-lucide-globe"
    class="w-fit"
    :aria-label="t('callout.language')"
  />
</template>

<script setup lang="ts">
import type { GetCalloutDataWith } from '@beabee/beabee-common';

import { toRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { useCalloutVariants } from '#components/pages/callouts/use-callout';

const props = defineProps<{
  callout: GetCalloutDataWith<'variantNames'>;
}>();

const { t } = useI18n();

const { variantItems, currentVariant } = useCalloutVariants(
  toRef(props, 'callout')
);
</script>
