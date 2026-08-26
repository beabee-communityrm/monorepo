<template>
  <div
    v-if="variantItems.length > 1"
    class="bg-elevated flex items-center gap-0.5 rounded-md p-0.5"
  >
    <button
      v-for="item in variantItems"
      :key="item.id"
      type="button"
      class="rounded-sm px-2.5 py-1 text-sm font-medium transition-colors"
      :class="
        currentVariant === item.id
          ? 'bg-default text-highlighted shadow-sm'
          : 'text-muted hover:text-highlighted'
      "
      @click="currentVariant = item.id"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { GetCalloutDataWith } from '@beabee/beabee-common';

import { toRef } from 'vue';

import { useCalloutVariants } from './use-callout';

const props = defineProps<{
  callout: GetCalloutDataWith<'variantNames'>;
}>();

const { variantItems, currentVariant } = useCalloutVariants(
  toRef(props, 'callout')
);
</script>
