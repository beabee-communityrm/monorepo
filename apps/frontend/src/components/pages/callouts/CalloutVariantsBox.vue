<template>
  <div
    v-if="variantItems.length > 1"
    class="mb-6 flex flex-wrap items-center rounded bg-white p-4 md:max-w-2xl"
  >
    <font-awesome-icon :icon="faGlobe" class="mr-2" />
    <AppToggle v-model="currentVariant" :items="variantItems" />
  </div>
</template>

<script setup lang="ts">
import type { GetCalloutDataWith } from '@beabee/beabee-common';
import { AppToggle } from '@beabee/vue';

import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { toRef } from 'vue';

import { useCalloutVariants } from './use-callout';

const props = defineProps<{
  callout: GetCalloutDataWith<'variantNames'>;
}>();

const { variantItems, currentVariant } = useCalloutVariants(
  toRef(props, 'callout')
);
</script>
