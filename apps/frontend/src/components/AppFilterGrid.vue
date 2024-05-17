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
import { computed } from 'vue';
import AppVTabs from './tabs/AppVTabs.vue';
import { type TabItem } from './tabs/tabs.interface';
import AppTabsCompact from './tabs/AppTabsCompact.vue';

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
