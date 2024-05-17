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
import { type TabItem } from './tabs.interface';
import AppVTabsItem from './AppVTabsItem.vue';

const emit = defineEmits(['update:modelValue']);

defineProps<{
  modelValue: string;
  items: TabItem[];
}>();
</script>
