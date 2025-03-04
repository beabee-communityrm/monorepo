<template>
  <ul
    class="-mx-4 mb-4 flex select-none snap-x snap-mandatory overflow-x-scroll border-y border-primary-40 px-4 text-sm md:mb-6"
  >
    <li v-for="item in items" :key="item.id" class="flex-none snap-center">
      <AppTabsCompactItem
        :item="item"
        :selected="modelValue === item.id"
        @click="emit('update:modelValue', $event)"
      />
    </li>
  </ul>
</template>
<script lang="ts" setup>
import type { TabItem } from './tabs.interface';
import AppTabsCompactItem from './AppTabsCompactItem.vue';

const emit = defineEmits(['update:modelValue']);

defineProps<{
  modelValue: string;
  items: TabItem[];
}>();
</script>
