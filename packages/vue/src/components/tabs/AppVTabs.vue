<template>
  <ul class="flex flex-col">
    <li v-for="item in items" :key="item.id">
      <AppVTabsItem
        :item="item"
        :selected="modelValue === item.id"
        @click="emit('update:modelValue', $event)"
      />
    </li>
  </ul>
</template>
<script lang="ts" setup>
import { type TabItem } from '../../types/tabs.interface';
import AppVTabsItem from './AppVTabsItem.vue';

const emit = defineEmits(['update:modelValue']);

export interface AppVTabsProps {
  modelValue: string;
  items: TabItem[];
}

defineProps<AppVTabsProps>();
</script>
