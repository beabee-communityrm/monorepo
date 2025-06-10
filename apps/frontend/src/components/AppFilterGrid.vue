<template>
  <div class="flex-none md:hidden md:basis-menu">
    <AppTabsCompact v-model="currentItem" :items="items" />
  </div>
  <div class="flex flex-col gap-6 md:flex-row">
    <div class="flex-none md:basis-menu">
      <AppVTabs v-model="currentItem" :items="items" class="hidden md:block" />
    </div>
    <div class="flex-auto">
      <slot />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { AppTabsCompact, AppVTabs } from '@beabee/vue/components';
import type { TabItem } from '@beabee/vue/types';

import { computed } from 'vue';

const emit = defineEmits(['update:modelValue']);
const props = defineProps<{
  items: TabItem[];
  modelValue: string;
}>();

const currentItem = computed({
  get: () => props.modelValue,
  set: (item) => emit('update:modelValue', item),
});
</script>
