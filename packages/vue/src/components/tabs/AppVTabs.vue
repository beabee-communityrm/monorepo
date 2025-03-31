<template>
  <ul class="flex flex-col gap-y-1">
    <li v-for="item in items" :key="item.id">
      <AppVTabsItem
        v-if="!item.hidden"
        :item="item"
        :selected="modelValue === item.id"
        @click="emit('update:modelValue', $event)"
      />
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { type TabItem } from './tabs.interface';
import AppVTabsItem from './AppVTabsItem.vue';

const emit = defineEmits(['update:modelValue']);

export interface AppVTabsProps {
  modelValue: string | undefined;
  items: TabItem[];
}

defineProps<AppVTabsProps>();
</script>
